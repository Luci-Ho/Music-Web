import React from "react";
import { useNavigate } from 'react-router-dom';
import '../style/Layout.css' 
import '../style/VA.css';

const backIcon = "https://res.cloudinary.com/da4y5zf5k/image/upload/v1751041190/ooui_next-ltr_np1svd.png";

const ViewAll = () => {
    const navigate = useNavigate()
    

    return (
    <div className="container ">
        <div className="content bluebox">
            <div className="TopPart">
                <img
                        src={backIcon}
                        alt="Back"
                        className="iconback"
                        onClick={() => navigate(-1)}
                    />
                <div className="Tag">
                    <p>Share</p>
                    <p>About</p>
                    <p>Premium</p>
                    <p className="bi bi-person-circle" />
                </div>
            </div>
        </div>
    </div>

    );
};

export default ViewAll;