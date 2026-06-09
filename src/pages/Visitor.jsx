import { useRef, useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from "../lib/supabaseClient"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";

function Visitor() {
  // 상태 추가
  const { user } = useAuth();
  const [ posts, setPosts ] = useState([]);
  const [ comments, setComments ] = useState({});
  const [ newComment, setNewComment ] = useState({});
  const [ newPost, setNewPost ] = useState('');
  const postTextareaRef = useRef(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const commentInputRefs = useRef({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
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
    const { data, error } = await supabase.from("guestbook_comments").select(`id, post_id, content, created_at, user_id, is_deleted, profiles!inner(username)`).eq("post_id", postId).eq("is_deleted", false).order("created_at", { ascending: true });

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
  // 게시글 수정
  const updatePost = async (postId) => {
    const { error } = await supabase
      .from("guestbook_posts")
      .update({
        content: editingContent
      })
      .eq("id", postId);

    if (error) {
      console.error(error);
      return;
    }

    setEditingPost(null);
    setEditingContent("");

    fetchPosts();
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
  //댓글 수정
  const updateComment = async (commentId, postId) => {
    const { error } = await supabase.from("guestbook_comments").update({
        content: editingCommentText
      }).eq("id", commentId);

    if (error) {
      console.error(error);
      return;
    }

    setEditingCommentId(null);
    setEditingCommentText("");

    fetchComments(postId);
  };

  // 게시글 삭제 (soft delete)
  const deletePost = async (postId) => {
    const { data, error } = await supabase.from("guestbook_posts").update({ is_deleted: true }).eq("id", postId);

    console.log("DELETE POST RESULT:", { data, error });

    const { data: user } = await supabase.auth.getUser();
    console.log("AUTH USER:", user);
    const { data: session } = await supabase.auth.getSession();
    console.log("SESSION:", session);

    if (!error) {
      fetchPosts();
    }
  };
  // 댓글 삭제 (soft delete)
  const deleteComment = async (commentId, postId) => {
    const { error } = await supabase.from("guestbook_comments").update({ is_deleted: true }).eq("id", commentId);
    if (!error) {
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== commentId)
      }));
    }
  };

  // 날짜 시간 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const hh = String((date.getHours() + 9) % 24).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  return (
    <div className="visit">
      <h2>Visitor</h2>
      <p>방명록임...</p>
      <div className="content">
      {user ?
      <>
        <div className="createText">
          <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter" && e.shiftKey === false) {e.preventDefault(); createPost();}}} placeholder="내용을 입력하세요" />
        </div>
        <p className="write"><button onClick={createPost} disabled={!newPost.trim()}><span>글작성</span></button></p>
       </>
       : <p className="need_login">로그인 후 글을 작성하실 수 있습니다...</p>
       }
        <ul className="list">
        {posts.map(post => (
          <li key={post.id}>
            <div className="writer">
              <span className="user">{post.profiles?.username}</span>
              <span className="date">{formatDate(post.created_at)}</span>
              {user?.id === post.user_id && (
                <>
                  <FontAwesomeIcon className="modify" title="수정" icon={faPenToSquare} onClick={() => {setEditingPost(post.id); setEditingContent(post.content); setTimeout(() => {postTextareaRef.current?.focus();}, 0);}} />
                  <FontAwesomeIcon className="delete" title="삭제" icon={faTrashCan} onClick={() => deletePost(post.id)} />
                </>
              )}
            </div>
            <div className="text">
              {editingPost === post.id ? (
                <>
                <textarea ref={postTextareaRef} value={editingContent} onChange={(e) => setEditingContent(e.target.value)}></textarea>
                <button className="edit_complete" onClick={() => updatePost(post.id)}><span>저장</span></button>
                <button className="edit_cancel" onClick={() => setEditingPost(null)}><span>취소</span></button>
                </>
              ) : (
                post.content
              )}
            </div>
            <div className="replys">
              <ul>
                {(comments[post.id] || []).filter(comment => !comment.is_deleted).map(comment => (
                  <li key={comment.id}>
                  <div className="reply_writer">
                    <span className="user">{comment.profiles?.username}</span>
                    <span className="date">{formatDate(comment.created_at)}</span>
                    {user?.id === comment.user_id && (
                        <>
                        <FontAwesomeIcon className="modify" title="수정" icon={faPenToSquare} onClick={() => {setEditingCommentId(comment.id); setEditingCommentText(comment.content); setTimeout(() => {commentInputRefs.current[comment.id]?.focus();}, 0);}} />
                        <FontAwesomeIcon className="delete" title="삭제" icon={faTrashCan} onClick={() => deleteComment(comment.id, post.id)} />
                      </>
                    )}
                  </div>
                  <div className="comment">
                    {editingCommentId === comment.id ? (
                      <>
                        <input ref={(el) => (commentInputRefs.current[comment.id] = el)} value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)}/>
                        <button className="edit_complete" onClick={() => updateComment(comment.id, post.id)}>저장</button>
                        <button className="edit_cancel" onClick={() => {setEditingCommentId(null); setEditingCommentText("");}}>취소</button>
                      </>
                    ) : (
                      comment.content
                    )}
                  </div>
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
    </div>
  )
}

export default Visitor;