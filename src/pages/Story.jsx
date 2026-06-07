import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { supabase } from "../lib/supabaseClient"

function Story() {
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState('');
  const uploadClick = () => {
    setShowUpload(prev => !prev);
  }

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    if(selected.length > 10){
      alert('최대 10개까지 업로드 가능합니다.');
      return;
    }
    setFiles(prev => [...prev, ...selected]);
    console.log(selected);
  }

  return (
    <div className="board">
      <h2>Story</h2>
      <p>vlog 업로드</p>
      {user && <FontAwesomeIcon icon={faPlus} onClick={uploadClick} className={showUpload ? "btn_upload on" : "btn_upload"}><span>등록</span></FontAwesomeIcon>}
      {user && 
        <div className={showUpload ? "upload_board on" : "upload_board"}>
          <div className="upload_content"><textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" /></div>
          <div className="upload_files">
            <span className="file_input"><input type="file" multiple accept="image/*, video/mp4" onChange={handleFiles} /></span>
            아... 개어렵다...
          </div>
        </div>
      }
    </div>
  )
}

export default Story;