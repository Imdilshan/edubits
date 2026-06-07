import { useState } from "react";
import axios from "axios";

function UploadTest() {

  const [file, setFile] = useState(null);

  const uploadFile = async () => {

    if (!file) {
      alert("Choose a file first");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    formData.append("title", "COA PYQ");
    formData.append("subject", "COA");
    formData.append("semester", 4);

    try {

      const res = await axios.post(
        "http://localhost:5001/api/pyqs/upload",
        formData
      );

      console.log("SERVER RESPONSE:", res.data);

      alert("Upload successful");

    } catch (err) {

      console.log(err);

      console.log(err.response?.data);

      alert("Upload failed");
    }
  };

  return (
    <div style={{ padding: "40px" }}>

      <h1>Cloudinary Upload Test</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={uploadFile}
        style={{
          marginLeft: "10px",
          padding: "10px",
        }}
      >
        Upload
      </button>

    </div>
  );
}

export default UploadTest;