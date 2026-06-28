import { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { supabase } from '../lib/supabaseClient'

const Setting = () => {
    const { user } = useAuth();
    const [photo, setPhoto] = useState(null);
    const [photoUrl, setPhotoUrl] = useState("");
    const [summary, setSummary] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const fetchProfile = async () => {
        if (!user) return;   // 안전장치
        const { data, error } = await supabase.from('profiles').select('photo, summary').eq('id', user.id).single();

        if(error){
            console.log(error);
            return;
        }

        setSummary(data.summary);

        if (data.photo) {
            setPhoto(data.photo);
            const { data: publicUrlData } = supabase.storage.from("profile").getPublicUrl(data.photo);
            setPhotoUrl(publicUrlData.publicUrl);
        }
    }
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        const url = URL.createObjectURL(file);

        setSelectedFile(file);
        setPreviewUrl(url);
    };
    const handleSave = async () => {
        let photoPath = photo;
        try {
            if (selectedFile) {
                if (photo) {
                    await deletePhoto();
                }

                const ext = selectedFile.name.split(".").pop();
                const fileName = `${user.id}_${Date.now()}.${ext}`;

                const { error } = await supabase.storage.from("profile").upload(fileName, selectedFile);
                if (error) throw error;
                photoPath = fileName;
            }

            const { data, error } = await supabase.from("profiles").update({ photo: photoPath, summary }).eq("id", user.id).select();

            if (error) throw error;

            fetchProfile();

            setSelectedFile(null);
            setPreviewUrl("");

        } catch (err) {
            console.error(err);
        }
    };
    const handleDeletePhoto = async () => {
        if (!photo) return;
        const ok = await deletePhoto();
        if (!ok) return;
        const { error } = await supabase.from("profiles").update({photo: null}).eq("id", user.id);

        if (error) {
            console.error(error);
            return;
        }

        setPhoto(null);
        setPhotoUrl("");
        setSelectedFile(null);
        setPreviewUrl("");
    };
    const deletePhoto = async () => {
        if (!photo) return true;

        const { error } = await supabase.storage.from("profile").remove([photo]);

        if (error) {
            console.error(error);
            return false;
        }

        return true;
    };

    return (
        <div className="global_content">
            <div className="setting_profile">
                <p className="thumbnails">
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    {previewUrl ? (
                        <img src={previewUrl} alt="" />
                    ) : (
                        photoUrl && <img src={photoUrl} alt="" />
                    )}
                </p>
                <button type="button" className="deletePhoto" onClick={handleDeletePhoto}>사진 삭제</button>
                <div className="summary">
                    <textarea value={summary || ""} onChange={(e) => setSummary(e.target.value)}></textarea>
                </div>
            </div>
            <button type="button" className="btn_save" onClick={handleSave}>저장</button>
        </div>
    );
}

export default Setting;