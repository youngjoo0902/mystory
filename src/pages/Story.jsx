import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { supabase } from "../lib/supabaseClient";

function Story() {
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);//추가 버튼

  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetchPosts();
  }, []);

  //추가 버튼 클릭시
  const uploadClick = () => {
    setShowUpload(prev => !prev);
  }

  //포스트 생성
  const createPost = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. 먼저 파일 검사 + 업로드
    const uploadedFiles = await uploadFiles(files);
    if (!uploadedFiles) return;

    // 2. 이제 posts 생성 (여기서 처음 생성)
    const { data: post, error } = await supabase.from('posts').insert({user_id: user.id, content, file_count: uploadedFiles.length}).select().single();
    if (error) return;

    const postId = post.id;
    // 3. post_files 저장
    await insertPostFiles(postId, uploadedFiles);

    // 4. thumbnail
    await setThumbnail(postId);

    // 5. reset
    setContent('');
    setFiles([]);
    setShowUpload(false);
  };

  //파일 업로드
  const uploadFiles = async (files, postId) => {
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const uploaded = [];

    // 1. 사전 검증 (중요)
    for (let file of files) {
      if (file.size > MAX_SIZE) {
        alert(`"${file.name}" 50MB를 넘는 파일은 업로드 할 수 없습니다.`);
        return null; // 전체 중단
      }
    }

    // 2. 업로드 진행
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}_${i}.${ext}`;
      const filePath = `posts/${postId}/${fileName}`;
      const { error } = await supabase.storage.from('media').upload(filePath, file);

      if (error) {
        console.log('upload fail:', error);
        return null;
      }

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);

      uploaded.push({
        url: data.publicUrl,
        type: file.type.startsWith('image') ? 'image' : 'video',
        sort_order: i
      });
    }

    return uploaded;
  };

  //post_files 저장
  const insertPostFiles = async (postId, files) => {
    await supabase.from('post_files').insert(files.map(file => ({
        post_id: postId,
        file_url: file.url,
        file_type: file.type,
        sort_order: file.sort_order
      }))
    );
  };

  //썸네일 설정
  const setThumbnail = async (postId) => {
    const { data: fileRow } = await supabase.from('post_files').select('id').eq('post_id', postId).order('sort_order', { ascending: true }).limit(1).single();
    if (!fileRow) return;
    await supabase.from('posts').update({ thumbnail_file_id: fileRow.id }).eq('id', postId);
  };

  //목록 만들기
  const fetchPosts = async () => {
    const { data: posts, error: postError } = await supabase.from('posts').select('*').order('created_at', { ascending: false });

    if (postError) {
      console.log(postError);
      return;
    }

    const { data: files, error: fileError } = await supabase.from('post_files').select('*');

    if (fileError) {
      console.log(fileError);
      return;
    }

    const merged = posts.map(post => ({
      ...post,
      post_files: files.filter(f => f.post_id === post.id)
    }));

    setPosts(merged);
  };
  //썸네일 뽑기
  const getThumbnail = (post) => {
    if (!post.post_files?.length) return null;

    const thumb = post.post_files.find(
      f => f.id === post.thumbnail_file_id
    );

    return thumb?.file_url || post.post_files[0]?.file_url;
  };


  return (
    <div className="global_content">
      <h2>Story</h2>
      <p className="subtitle">vlog 업로드</p>
      <div className="story">
        <ul className="posts">
          {posts.map(post => (
              <li key={post.id}>
                <Link to={`/story/${post.id}`}>
                  <p className="thumbs">
                    <img src={getThumbnail(post)} alt="" />
                  </p>
                </Link>
              </li>
            ))}
        </ul>
      </div>
      {user && <FontAwesomeIcon icon={faPlus} onClick={uploadClick} className={showUpload ? "btn_upload on" : "btn_upload"}><span>등록</span></FontAwesomeIcon>}
      {user && 
        <div className={showUpload ? "upload_board on" : "upload_board"}>
          <div className="upload_files">
            사진/동영상 선택
            <input type="file" multiple accept="image/*, video/*" onChange={(e) => {
              const selected = Array.from(e.target.files);
              if (selected.length > 10) {
                alert('최대 10개까지 업로드 가능합니다.');
                return;
              }
              setFiles(selected);
            }} />
          </div>
          <div className="upload_content">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" />
          </div>
          <p className="set_upload"><button onClick={createPost}>게시</button></p>
        </div>
      }
    </div>
  )
}

export default Story;