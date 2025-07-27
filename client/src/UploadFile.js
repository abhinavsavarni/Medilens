import React, { useState } from "react";
import { COLORS } from "./colors";

const styles = {
  card: {
    background: COLORS.medicineWhite,
    border: `2.5px solid ${COLORS.medicineBlue}`,
    borderRadius: 18,
    maxWidth: 450,
    margin: "4em auto 0",
    padding: "2.5em 2em 2em",
    boxShadow: `0 4px 24px 0 #b7dde9`,
    textAlign: "center"
  },
  h1: {
    color: COLORS.medicineBlue,
    letterSpacing: "0.04em",
    fontWeight: 900,
    fontSize: 34,
    margin: "0 0 5px"
  },
  subtitle: { 
    color: COLORS.medicineGreen,
    letterSpacing: ".02em",
    fontWeight: 500,
    fontSize: 17,
    lineHeight: 1.4,
    marginBottom: 25
  },
  input: {
    background: COLORS.medicineLightBlue,
    borderRadius: 5,
    border: `1.5px solid ${COLORS.medicineGrey}`,
    margin: "15px 0 10px",
    padding: "12px",
    fontSize: 16,
    width: "78%",
    outline: "none"
  },
  button: {
    background: COLORS.medicineBlue,
    color: "#fff",
    fontWeight: 700,
    padding: "11px 32px",
    borderRadius: 7,
    border: "none",
    fontSize: 18,
    marginTop: 10,
    letterSpacing: ".02em",
    cursor: "pointer",
    boxShadow: "0 2px 8px #dceef5"
  },
  preview: {
    margin: "13px auto 10px",
    borderRadius: 12,
    maxWidth: 190,
    maxHeight: 180,
    boxShadow: "0 2px 8px #a6d9dd"
  },
  label: {
    color: COLORS.medicineBlue,
    fontSize: 13,
    marginTop: 4
  },
  sectionHeader: color => ({
    color: color,
    fontWeight: 700,
    fontSize: 20,
    margin: "26px 0 7px",
    letterSpacing: ".01em"
  }),
  box: color => ({
    background: color,
    borderRadius: 10,
    padding: "15px 13px",
    textAlign: "left",
    fontSize: 16,
    whiteSpace: "pre-wrap",
    fontFamily: "inherit"
  }),
  error: {
    color: COLORS.medicineAccent,
    margin: "18px 0 5px",
    fontWeight: "600",
    background: "#ffeaea",
    borderRadius: 6,
    padding: "8px 12px"
  }
};

function UploadFile() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Upload failed.");
      setResult(data);
    } catch (err) {
      setError(err.message ?? "Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.h1}>Medilens</div>
      <div style={styles.subtitle}>
        <span role="img" aria-label="pill">💊</span> 
        AI-Powered Medicine Analyzer
      </div>

      <form onSubmit={handleSubmit} style={{marginBottom: "1.4em"}}>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={styles.input}
        />
        {file && (
          <div>
            <div style={styles.label}>
              Selected: <b>{file.name}</b>
              {file.type.startsWith("image/") && (
                <span style={{ color: COLORS.medicineGreen, marginLeft: 8 }}>Image detected</span>
              )}
            </div>
            {file.type.startsWith("image/") && (
              <img src={URL.createObjectURL(file)} alt="Preview" style={styles.preview} />
            )}
          </div>
        )}
        <button type="submit" style={styles.button} disabled={!file || loading}>
          {loading ? "Analyzing..." : file ? "Upload" : "Choose file"}
        </button>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      {result && (
        <div style={{ marginTop: 12 }}>
          {result.extractedText && (
            <>
              <div style={styles.sectionHeader(COLORS.medicineBlue)}>Extracted Text</div>
              <div style={styles.box(COLORS.medicineLightBlue)}>
                {result.extractedText}
              </div>
            </>
          )}
          {result.aiInsight && (
            <>
              <div style={styles.sectionHeader(COLORS.medicineGreen)}>AI Insights</div>
              <div style={styles.box("#e7fbee")}>
                {result.aiInsight}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadFile;
