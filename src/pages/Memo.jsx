import { useRef, useState, useEffect } from 'react'
import { supabase } from "../lib/supabaseClient"
import { useAuth } from '../context/AuthContext'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faFloppyDisk, faCircleXmark, faTrashCan } from "@fortawesome/free-solid-svg-icons";

function Memo() {
    /*
        - 로그인 되어있는지 체크한다.
        - 로그인 사용자는 자신의 아이디에 맞는 메모들을 db에서 가져온다. 메모리스트 상태관리는 배열로...
        - 가져온 메모리스트를 map으로 화면에 뿌린다.
        - 메모리스트의 미리보기는 기본값 3줄. \n 은 줄바꿈 처리.
        - 메모를 클릭하면 edit 클래스가 붙고, 상세보기면서 동시에 edit 가능한 textarea 상태가 된다. 상세보기 높이는 최대 300px
        - 저장, 취소, 삭제버튼이 있다. (soft delete)
        - 게시글 추가를 클릭하면, edit 모드의 li 가 리스트 제일 위에 추가된다.
    */
    const { user } = useAuth();
    const newMemoRef = useRef(null);
    const [ insertMemo, setInsertMemo ] = useState(false);
    const [ memos, setMemos ] = useState([]);
    const [ editingId, setEditingId ] = useState(null);
    const [ tempContent, setTempContent ] = useState("");
    // 최초 데이터 로딩
    useEffect(() => {
        if (!user) return;
        fetchPosts();
    }, [user]);
    // 추가 버튼
    const addMemo = () => {
        if (editingId !== null) return; // 🔥 기존 편집 중이면 차단

        setInsertMemo(true);
        setTempContent("");
        setTimeout(() => {
            newMemoRef.current?.focus();
        }, 0);
    }
    // 에디트 모드
    const editMode = (id, content) => {
        if (insertMemo) return;
        if (editingId !== null && editingId !== id) {
            return;
        }
        setEditingId(id);
        setTempContent(content ?? "");
    }
    // 게시글 조회
    const fetchPosts = async () => {
        const { data, error } = await supabase.from("memo").select(`*`).eq("user_id", user.id).is("deleted_at", null).order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        setMemos(data);
    }
    // 게시글 작성
    const createPost = async () => {
        const { data, error } = await supabase.from("memo").insert([{ user_id : user.id, content: tempContent}]);

        if (error) {
            console.error(error);
            return;
        }

        setTempContent("");
        setInsertMemo(false);
        fetchPosts();
    };
    // 게시글 수정
    const updatePost = async (id) => {
        const { data, error } = await supabase.from("memo").update({ content : tempContent, updated_at : new Date().toISOString() }).eq("id", id);

        if (error) {
            console.error(error);
            return;
        }

        setTempContent("");
        setEditingId(null);
        fetchPosts();
    };
    // 게시글 삭제
    const deletePost = async (id) => {
        const { data, error } = await supabase.from("memo").update({ deleted_at : new Date() }).eq("id", id);

        if (error) {
            console.error(error);
            return;
        }
        setEditingId(null);
        setTempContent("");
        fetchPosts();
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
            <h2>Memo</h2>
            <div className="memo_board">
                <ul className="memo_list">
                    {insertMemo &&
                    <li className="edit">
                        <div className="content">
                            <textarea ref={newMemoRef} placeholder="내용을 입력하세요" value={tempContent} onChange={(e) => setTempContent(e.target.value)}></textarea>
                        </div>
                        <div className="ctrl">
                            <button className="save" onClick={createPost}><FontAwesomeIcon title="저장" icon={faFloppyDisk} /><span>저장</span></button>
                            <button className="cancel" onClick={() => setInsertMemo(false)}><FontAwesomeIcon title="취소" icon={faCircleXmark} /><span>취소</span></button>
                        </div>
                    </li>
                    }
                    {memos.map(item => (
                        <li key={item.id} className={editingId === item.id ? "edit" : ""}>
                            <div className="content">
                                <textarea value={editingId === item.id ? tempContent : item.content} onClick={() => editMode(item.id, item.content)} onChange={(e) => setTempContent(e.target.value)} placeholder="내용을 입력하세요" readOnly={editingId !== item.id}></textarea>
                                <p className="writedby">
                                    <span>작성일 : {formatDate(item.created_at)}</span>
                                    {item.updated_at && <span>수정일 : {formatDate(item.updated_at)}</span>}
                                </p>
                            </div>
                            <div className="ctrl">
                                <button className="save" onClick={() => updatePost(item.id)}><FontAwesomeIcon title="저장" icon={faFloppyDisk} /><span>저장</span></button>
                                <button className="cancel" onClick={() => {setEditingId(null); setTempContent("");}}><FontAwesomeIcon title="취소" icon={faCircleXmark} /><span>취소</span></button>
                                <button className="delete" onClick={() => deletePost(item.id)}><FontAwesomeIcon title="삭제" icon={faTrashCan} /><span>삭제</span></button>
                            </div>
                        </li>
                        )
                    )}
                </ul>
                {(!insertMemo && !editingId) &&
                    <button className="add" onClick={addMemo}><FontAwesomeIcon icon={faPlus}><span>추가</span></FontAwesomeIcon></button>
                }
            </div>
        </div>
    );
}

export default Memo;