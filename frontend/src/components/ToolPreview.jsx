export default function ToolPreview({ title, image }) {
  return (
    <div className="tool-preview">

      <div className="preview-thumbnail">
         <img src={image} alt={title} />
      </div>

      <div className="preview-content">
        
      </div>

    </div>
  );
}