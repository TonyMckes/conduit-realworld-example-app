import ArticleEditorForm from "../components/ArticleEditorForm";
import ContainerRow from "../components/ContainerRow";

function ArticleEditor() {
  return (
    <div className="editor-page">
      <ContainerRow type="page">
        <div className="col-md-10 offset-md-1 col-xs-12">
          <ArticleEditorForm />
        </div>
      </ContainerRow>
    </div>
  );
}

export default ArticleEditor;
