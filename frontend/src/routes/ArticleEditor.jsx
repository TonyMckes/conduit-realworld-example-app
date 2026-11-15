import { useParams } from "react-router-dom";
import ArticleEditorForm from "../components/ArticleEditorForm";
import ContainerRow from "../components/ContainerRow";

function ArticleEditor() {
  const { slug } = useParams();

  return (
    <div className="editor-page">
      <ContainerRow type="page">
        <div className="col-md-10 offset-md-1 col-xs-12">
          {/* A fresh editor for every article, so nothing carries over */}
          <ArticleEditorForm key={slug || "new"} />
        </div>
      </ContainerRow>
    </div>
  );
}

export default ArticleEditor;
