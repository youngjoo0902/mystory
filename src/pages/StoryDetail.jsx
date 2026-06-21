import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from "../lib/supabaseClient";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

function StoryDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileDirections, setFileDirections] = useState({});
  useEffect(() => {
    fetchPost();
  }, [id]);

  useEffect(() => {
    files.forEach(file => {

      // 이미지
      if (file.file_type === 'image') {
        const img = new Image();

        img.onload = () => {
          setFileDirections(prev => ({
            ...prev,
            [file.id]:
              img.width > img.height ? 'landscape' : 'portrait'
          }));
        };

        img.src = file.file_url;
      }

      // 동영상
      if (file.file_type === 'video') {
        const video = document.createElement('video');

        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          setFileDirections(prev => ({
            ...prev,
            [file.id]:
              video.videoWidth > video.videoHeight ? 'landscape' : 'portrait'
          }));
        };

        video.src = file.file_url;
      }

    });
  }, [files]);
  const fetchPost = async () => {
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();

    if (error) {
      console.log(error);
      return;
    }

    const { data: fileData, error: fileError } = await supabase.from('post_files').select('*').eq('post_id', id).order('sort_order', { ascending: true });
    if (fileError) {
      console.log(fileError);
      return;
    }

    setPost(data);
    setFiles(fileData);
  };

  // 날짜 시간 포맷
  const formatDate = (dateString) => {
      const date = new Date(dateString);

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      const hh = String((date.getHours() + 9) % 24).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");

      return `${yyyy}년 ${mm}월 ${dd}일 ${hh}시 ${min}분`;
  };

  return (
    <div className="global_content">
      <div className="story">
        <div className="viewer">
          <div className="list_section">
            <Swiper modules={[Pagination]} spaceBetween={20} slidesPerView={1} pagination={files.length > 1 ? { clickable: true } : false}>
              {files.map(file => (
                <SwiperSlide key={file.id}>
                  {file.file_type === 'image' ? (
                    <img src={file.file_url} className={fileDirections[file.id]} alt="" />
                  ) : (
                    <video src={file.file_url} controls className={fileDirections[file.id]} />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="post_info">
            <button className="like">
              <svg xmlns="http://www.w3.org/2000/svg" className="solid" viewBox="0 0 640 640"><path d="M442.9 144C415.6 144 389.9 157.1 373.9 179.2L339.5 226.8C335 233 327.8 236.7 320.1 236.7C312.4 236.7 305.2 233 300.7 226.8L266.3 179.2C250.3 157.1 224.6 144 197.3 144C150.3 144 112.2 182.1 112.2 229.1C112.2 279 144.2 327.5 180.3 371.4C221.4 421.4 271.7 465.4 306.2 491.7C309.4 494.1 314.1 495.9 320.2 495.9C326.3 495.9 331 494.1 334.2 491.7C368.7 465.4 419 421.3 460.1 371.4C496.3 327.5 528.2 279 528.2 229.1C528.2 182.1 490.1 144 443.1 144zM335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1C576 297.7 533.1 358 496.9 401.9C452.8 455.5 399.6 502 363.1 529.8C350.8 539.2 335.6 543.9 320 543.9C304.4 543.9 289.2 539.2 276.9 529.8C240.4 502 187.2 455.5 143.1 402C106.9 358.1 64 297.7 64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1L320 171.8L335 151.1z"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="fill" viewBox="0 0 640 640"><path d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/></svg>
            </button>
            <span className="like_count">{post?.like_count ?? 0}</span>
            <span className="see"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z"/></svg></span>
            <span className="see_count">{post?.view_count ?? 0}</span>
            <span className="reply"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M64 304C64 358.4 83.3 408.6 115.9 448.9L67.1 538.3C65.1 542 64 546.2 64 550.5C64 564.6 75.4 576 89.5 576C93.5 576 97.3 575.4 101 573.9L217.4 524C248.8 536.9 283.5 544 320 544C461.4 544 576 436.5 576 304C576 171.5 461.4 64 320 64C178.6 64 64 171.5 64 304zM158 471.9C167.3 454.8 165.4 433.8 153.2 418.7C127.1 386.4 112 346.8 112 304C112 200.8 202.2 112 320 112C437.8 112 528 200.8 528 304C528 407.2 437.8 496 320 496C289.8 496 261.3 490.1 235.7 479.6C223.8 474.7 210.4 474.8 198.6 479.9L140 504.9L158 471.9zM208 336C225.7 336 240 321.7 240 304C240 286.3 225.7 272 208 272C190.3 272 176 286.3 176 304C176 321.7 190.3 336 208 336zM352 304C352 286.3 337.7 272 320 272C302.3 272 288 286.3 288 304C288 321.7 302.3 336 320 336C337.7 336 352 321.7 352 304zM432 336C449.7 336 464 321.7 464 304C464 286.3 449.7 272 432 272C414.3 272 400 286.3 400 304C400 321.7 414.3 336 432 336z"/></svg></span>
            <span className="reply_count">{post?.comment_count ?? 0}</span>
          </div>
          <span className="post_date">
            {post?.created_at &&
              formatDate(post.created_at)
            }
          </span>
          <div className="text_section">
            {post?.content}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryDetail;