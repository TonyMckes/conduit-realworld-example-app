import ContainerRow from "../components/ContainerRow";
import SettingsForm from "../components/SettingsForm";

function Settings() {
  return (
    <div className="settings-page">
      <ContainerRow type="page">
        <div className="col-md-6 offset-md-3 col-xs-12">
          <h1 className="text-xs-center">Your Settings</h1>
          <SettingsForm />
        </div>
      </ContainerRow>
    </div>
  );
}

export default Settings;
