import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from "../lib/supabaseClient"

function Visitor() {
  // 상태 추가
  const { user } = useAuth();
  const [ posts, setPosts ] = useState([]);
  const [ comments, setComments ] = useState({});
  const [ newComment, setNewComment ] = useState({});
  const [ newPost, setNewPost ] = useState('');
  // 데이터 로딩 (방명록 + 댓글)
  useEffect(() => {
    fetchPosts();
  }, []);
  // 게시글 + 작성자 가져오기
  const fetchPosts = async () => {
    const { data, error } = await supabase.from("guestbook_posts").select(`id, content, created_at, user_id, profiles!inner(username)`).eq("is_deleted", false).order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setPosts(data);

    // 각 게시글 댓글도 같이 로드
    data.forEach(post => {
      fetchComments(post.id);
    });
  };
  const fetchComments = async (postId) => {
    const { data, error } = await supabase.from("guestbook_comments").select(`id, post_id, content, created_at, user_id, profiles!inner(username)`).eq("post_id", postId).eq("is_deleted", false).order("created_at", { ascending: true });

    if (error) return;

    setComments(prev => ({
      ...prev,
      [postId]: data
    }));
  };
  // 게시글 작성
  const createPost = async () => {
    if (!newPost.trim()) return;

    const { error } = await supabase.from("guestbook_posts").insert({
      user_id: user?.id,
      content: newPost
    });

    if (error) {
      console.error(error);
      return;
    }

    setNewPost(""); // 입력 초기화
    fetchPosts();   // 목록 갱신
  };

  //댓글 작성
  const createComment = async (postId) => {
    if (!newComment[postId]) return;

    const { error } = await supabase.from("guestbook_comments").insert({
        post_id: postId,
        user_id: user?.id,
        content: newComment[postId]
      });

    if (!error) {
      setNewComment(prev => ({
        ...prev,
        [postId]: ""
      }));

      fetchComments(postId);
    }
  };

  // 게시글 삭제 (soft delete)
  const deletePost = async (postId) => {
    await supabase.from("guestbook_posts").update({ is_deleted: true }).eq("id", postId);

    fetchPosts();
  };
  // 댓글 삭제 (soft delete)
  const deleteComment = async (commentId, postId) => {
    await supabase.from("guestbook_comments").update({ is_deleted: true }).eq("id", commentId);

    fetchComments(postId);
  };

  // 날짜 시간 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const hh = String(date.getHours() + 9).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  return (
    <div className="visit">
      <h2>Visitor</h2>
      <p>방명록임...</p>
      <div className="content">
        <ul className="list">
        {posts.map(post => (
          <li key={post.id}>
            <div className="writer">
              <span className="user">{post.profiles?.username}</span>
              <span className="date">{formatDate(post.created_at)}</span>
              {/* {user?.id === post.user_id && (
                <button className="delete" onClick={() => deletePost(post.id)}>❌</button>
              )} */}
            </div>
            <div className="text">{post.content}</div>
            <div className="replys">
              <ul>
                {(comments[post.id] || []).map(comment => (
                  <li key={comment.id}>
                  <div className="reply_writer">
                    <span className="user">{comment.profiles?.username}</span>
                    <span className="date">{formatDate(comment.created_at)}</span>
                    {/* {user?.id === comment.user_id && (
                      <button className="delete" onClick={() => deleteComment(comment.id, post.id)}>❌</button>
                    )} */}
                  </div>
                  <div className="comment">{comment.content}</div>
                </li>
                ))}
              </ul>
            </div>
            {user &&
            <p className="reply">
              <input type="text" value={newComment[post.id] || ""} onChange={(e) => setNewComment({...newComment, [post.id]: e.target.value})}/>
              <button onClick={() => createComment(post.id)}>댓글 등록</button>
            </p>
            }
          </li>
          ))}
        </ul>
      </div>
      {user ?
      <>
        <div className="createText">
          <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter" && e.shiftKey === false) {e.preventDefault(); createPost();}}} placeholder="내용을 입력하세요" />
        </div>
        <p className="write"><button onClick={createPost} disabled={!newPost.trim()}><span>글작성</span></button></p>
       </>
       : <p className="need_login">로그인 후 글을 작성하실 수 있습니다.</p>
       }
    </div>
  )
}

export default Visitor;