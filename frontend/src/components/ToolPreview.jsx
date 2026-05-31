export default function ToolPreview({ title, image }) {
  return (
    <div className="tool-preview">

      <div className="preview-thumbnail">
         <img src={image} alt={title} loading="lazy" decoding="async" />
      </div>

      <div className="preview-content">
        
      </div>

    </div>
  );
}
