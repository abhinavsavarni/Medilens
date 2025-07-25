import React, { useState } from "react";

function UploadFile() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleChange} />
      <button type="submit" disabled={!file || loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default UploadFile;
