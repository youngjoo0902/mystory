import { useRef, useState, useEffect } from 'react'
import { supabase } from "../lib/supabaseClient"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";

function Guest() {
  // 상태 추가
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const [editingPost, setEditingPost] = useState(null);
  const [editingComment, setEditingComment] = useState(null);

  const [pwModal, setPwModal] = useState({
    open: false,
    type: "", // "edit" | "delete"
    targetId: null,
    postId: null,
    input: ""
  });
  const pwInputRef = useRef(null);
  const postTextareaRefs = useRef({});
  const commentInputRefs = useRef({});
  const [pwState, setPwState] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (pwModal.open) {
      // 렌더링 끝난 직후 포커스
      setTimeout(() => {
        pwInputRef.current?.focus();
      }, 0);
    }
  }, [pwModal.open]);

  useEffect(() => {
    if (editingPost) {
      postTextareaRefs.current[editingPost]?.focus();
    }
  }, [editingPost]);
  useEffect(() => {
    if (editingComment) {
      commentInputRefs.current[editingComment]?.focus();
    }
  }, [editingComment]);

  // 게시글 작성
  const createPost = async () => {
    if(!name){alert('이름을 입력해주세요'); return;}
    if(!password){alert('비밀번호를 입력해주세요'); return;}
    if(!content){alert('내용을 입력해주세요'); return;}

    const { error } = await supabase.from("guest_posts").insert({author : name, password, content, is_deleted : false});
    if (error) return;

    setName("");
    setPassword("");
    setContent("");
    fetchPosts();
  };

  // 게시글 조회
  const fetchPosts = async () => {
    const { data, error } = await supabase.from("guest_posts").select("*").eq("is_deleted", false).order("created_at", { ascending: false });
    if (error) return;

    setPosts(data);
    data.forEach(post => fetchComments(post.id));
  };

  // 게시글 수정
  const updatePost = async (postId) => {
    const post = posts.find(p => p.id === postId);

    const { error } = await supabase.from("guest_posts").update({
        content: post.editContent ?? post.content,
        updated_at: new Date()
      }).eq("id", postId);

    if (error) {
      console.log(error);
      return;
    }

    setEditingPost(null);
    fetchPosts();
  };

  // 댓글 작성
  const createComment = async (postId) => {
    const input = commentInputs[postId];

    if (!input?.author) return alert("이름을 입력해주세요");
    if (!input?.password) return alert("비밀번호를 입력해주세요");
    if (!input?.content) return alert("내용을 입력해주세요");

    const { error } = await supabase.from("guest_comments").insert({post_id: postId, author: input.author, password: input.password, content: input.content,});
    if (error) {
      console.log(error);
      return;
    }

    // 초기화
    setCommentInputs({
      ...commentInputs,
      [postId]: { author: "", password: "", content: "" },
    });

    fetchComments(postId);
  };

  // 댓글 조회
  const fetchComments = async (postId) => {
    const { data, error } = await supabase.from("guest_comments").select("*").eq("post_id", postId).eq("is_deleted", false).order("created_at", { ascending: true });
    if (error) {
      console.error("fetchComments error:", error);
      return;
    }

    setComments(prev => ({
      ...prev,
      [postId]: data
    }));
  };

  // 댓글 수정
  const updateComment = async (postId, commentId) => {
    const comment = comments[postId].find(c => c.id === commentId);

    const { error } = await supabase.from("guest_comments").update({
        content: comment.editContent ?? comment.content,
        updated_at: new Date()
      }).eq("id", commentId);

    if (error) {
      console.log(error);
      return;
    }

    setEditingComment(null);
    fetchComments(postId);
  };

  // 게시글 비밀번호 인증
  const verifyPostPassword = async (postId, inputPw) => {
    const { data, error } = await supabase.from("guest_posts").select("password").eq("id", postId).single();
    if (error) return false;
    return data.password === inputPw;
  };
  // 댓글 비밀번호 인증
  const verifyCommentPassword = async (commentId, inputPw) => {
    const { data, error } = await supabase.from("guest_comments").select("password").eq("id", commentId).single();
    if (error) return false;
    return data.password === inputPw;
  };

  const openPwModal = (type, id, postId = null) => {
    setPwModal({
      open: true,
      type,
      targetId: id,
      postId,
      input: ""
    });
  };

  // 모달 확인 핸들러
  const handlePwConfirm = async () => {
    const { type, targetId, input, postId } = pwModal;
    console.log(type, targetId, input);

    let ok = false;

    if (type === "edit" || type === "delete") {
      ok = await verifyPostPassword(targetId, input);
    }

    if (type === "editComment" || type === "deleteComment") {
      ok = await verifyCommentPassword(targetId, input);
    }

    if (!ok) {
      pwModal.input.length === 4 ? setPwState(false) : setPwState(true);
      // alert("비밀번호가 틀렸습니다");
      // setPwModal(prev => ({...prev, input: ''}));
      // setTimeout(() => {
      //   pwInputRef.current?.focus();
      // }, 0);
      return;
    }

    setPwState(true);

    // 성공 처리
    if (type === "edit") {
      setEditingPost(targetId);
    }

    if (type === "delete") {
      await supabase.from("guest_posts").update({ is_deleted: true }).eq("id", targetId);
      fetchPosts();
    }

    if (type === "editComment") {
      setEditingComment(targetId);
      setTimeout(() => {
        commentInputRefs.current[targetId]?.focus();
      }, 0);
    }

    if (type === "deleteComment") {
      await supabase.from("guest_comments").update({ is_deleted: true }).eq("id", targetId);

      fetchComments(pwModal.postId);
    }

    setPwModal({ open: false, type: "", targetId: null, postId: null, input: "" });
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
    <div className="global_content">
      <h2>Guest</h2>
      <p className="subtitle">(방명록임)</p>
      <div className="visit_content">
        <div className="guest">
          <table>
            <colgroup>
              <col style={{width : '50px'}} />
              <col />
              <col style={{width : '50px'}} />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <th>이름</th>
                <td><label><input type="text" value={name} onChange={(e) => setName(e.target.value)} /></label></td>
                <th>비밀번호</th>
                <td><label><input type="password" value={password} maxLength={4} onChange={(e) => setPassword(e.target.value)} /></label></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="createText">
          <textarea placeholder="내용을 입력하세요" onChange={(e) => setContent(e.target.value)} value={content} />
        </div>
        <p className="write"><button onClick={createPost}><span>글작성</span></button></p>
        <ul className="list">
          {posts.map(post => (
          <li key={post.id}>
            <div className="writer">
              <span className="user">{post.author}</span>
              <span className="date">{formatDate(post.created_at)}</span>
                  <FontAwesomeIcon className="modify" title="수정" icon={faPenToSquare} onClick={() => openPwModal("edit", post.id)} />
                  <FontAwesomeIcon className="delete" title="삭제" icon={faTrashCan} onClick={() => openPwModal("delete", post.id)} />
            </div>
            <div className="text">
              {editingPost === post.id ? (
                <>
                  <textarea ref={(el) => (postTextareaRefs.current[post.id] = el)}
                        value={post.editContent ?? post.content} onChange={(e) => {
                        setPosts(prev => prev.map(p => 
                          p.id === post.id
                          ? { ...p, editContent: e.target.value }
                          : p
                        )
                      );
                    }}
                  ></textarea>
                  <button className="edit_complete" onClick={() => updatePost(post.id)}><span>저장</span></button>
                  <button className="edit_cancel" onClick={() => setEditingPost(null)}><span>취소</span></button>
                </>
              ) :
                post.content.split('\n').map((item, i) => {
                  return (
                    <span key={i}>{item}<br /></span>
                  )
                })
              }
            </div>
            <div className="replys">
              <ul>
                {comments[post.id]?.map(comment => (
                <li key={comment.id}>
                  <div className="reply_writer">
                    <span className="user">{comment.author}</span>
                    <span className="date">{formatDate(comment.created_at)}</span>
                    <FontAwesomeIcon className="modify" title="수정" icon={faPenToSquare} onClick={() => openPwModal("editComment", comment.id)} />
                    <FontAwesomeIcon className="delete" title="삭제" icon={faTrashCan} onClick={() => openPwModal("deleteComment", comment.id, post.id)} />
                  </div>
                  <div className="comment">
                    {editingComment === comment.id ? (
                      <>
                        <input
                          ref={(el) => (commentInputRefs.current[comment.id] = el)}
                          value={comment.editContent ?? comment.content}
                          onChange={(e) => {
                            setComments(prev => ({
                              ...prev,
                              [post.id]: prev[post.id].map(c =>
                                c.id === comment.id
                                  ? { ...c, editContent: e.target.value }
                                  : c
                              )
                            }));
                          }}
                        />
                        <button className="edit_complete" onClick={() => updateComment(post.id, comment.id)}><span>저장</span></button>
                        <button className="edit_cancel" onClick={() => setEditingComment(null)}><span>취소</span></button>
                      </>
                    ) : (
                      comment.content
                    )}
                  </div>
                </li>
                ))}
              </ul>
            </div>
            <div className="guest_comment">
              <table>
                <colgroup>
                  <col style={{width : '50px'}} />
                  <col />
                  <col style={{width : '50px'}} />
                  <col />
                </colgroup>
                <tbody>
                  <tr>
                    <th>이름</th>
                    <td>
                      <label>
                        <input type="text" placeholder="이름"
                          value={commentInputs[post.id]?.author || ""}
                          onChange={(e) =>
                            setCommentInputs({
                            ...commentInputs,
                            [post.id]: {
                              ...commentInputs[post.id],
                              author: e.target.value,
                            },
                          })
                        } />
                      </label>
                    </td>
                    <th>비밀번호</th>
                    <td>
                      <label>
                        <input type="password"
                          placeholder="비밀번호"
                          maxLength={4}
                          value={commentInputs[post.id]?.password || ""}
                          onChange={(e) =>
                            setCommentInputs({
                              ...commentInputs,
                              [post.id]: {
                                ...commentInputs[post.id],
                                password: e.target.value,
                              },
                            })
                        } />
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="reply">
              <input type="text" placeholder="댓글 내용"
                  value={commentInputs[post.id]?.content || ""}
                  onChange={(e) =>
                    setCommentInputs({
                      ...commentInputs,
                      [post.id]: {
                        ...commentInputs[post.id],
                        content: e.target.value,
                      },
                    })
                } />
              <button onClick={() => {createComment(post.id, commentInputs[post.id]);}}>댓글 등록</button>
            </p>
          </li>
          ))}
        </ul>
      </div>
      {pwModal.open && (
      <div className="layer_pw">
        <div className="cont">
          <p className="title">비밀번호를 입력하세요.</p>
          <button className="close" onClick={e => {
            e.preventDefault();
            setPwState(true);
            setPwModal({
              open: false,
              type: "",
              targetId: null,
              input: ""
            })
          }}><span>닫기</span></button>
          <label><input type="password" ref={pwInputRef} maxLength={4} value={pwModal.input} onKeyUp={handlePwConfirm} onChange={(e) => setPwModal(prev => ({...prev, input: e.target.value}))} /></label>
          {!pwState && <p className="suggest">비밀번호가 틀렸습니다.</p>}
          <p className="confirm"><button onClick={handlePwConfirm}>확인</button></p>
        </div>
      </div>
      )}
    </div>
  )
}

export default Guest;