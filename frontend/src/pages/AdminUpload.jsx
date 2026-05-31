import ResourceUploader from "../components/upload/ResourceUploader";

export default function AdminUpload() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Upload PDFs</h1>
      <ResourceUploader />
    </div>
  );
}
