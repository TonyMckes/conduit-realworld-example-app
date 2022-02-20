function FormFieldset({
  children,
  type,
  normal,
  placeholder,
  name,
  value,
  handler,
  required,
}) {
  return (
    <fieldset className="form-group">
      <input
        type={type}
        className={`form-control ${!normal ? "form-control-lg" : ""}`}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={handler}
        required={required}
      />
      {children}
    </fieldset>
  );
}

export default FormFieldset;
