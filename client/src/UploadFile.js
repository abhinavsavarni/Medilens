import React, { useState } from "react";

function UploadFile() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null); // Reset previous result
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
      if (!response.ok) throw new Error("Upload failed.");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleChange}
      />
      {file && <div>Selected file: <b>{file.name}</b></div>}
      {file && file.type.startsWith("image/") && (
        <img
          src={URL.createObjectURL(file)}
          alt="Preview"
          style={{ maxWidth: "200px", marginTop: "1em" }}
        />
      )}
      <button type="submit" disabled={!file || loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {result && (
        <div style={{ marginTop: "1rem", textAlign: "left" }}>
          {result.extractedText && (
            <>
              <h3>Extracted Text:</h3>
              <pre style={{ whiteSpace: "pre-wrap" }}>{result.extractedText}</pre>
            </>
          )}
          {result.aiInsight && (
            <>
              <h3>AI Insight:</h3>
              <pre style={{ whiteSpace: "pre-wrap" }}>{result.aiInsight}</pre>
            </>
          )}
          {result.error && <div style={{ color: "red" }}>{result.error}</div>}
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

export default UploadFile;
