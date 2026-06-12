function soloDigitos(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatearTelefono(value) {
  const digitos = soloDigitos(value);
  if (digitos.length !== 10) return String(value || '').trim();
  return `${digitos.slice(0, 3)}-${digitos.slice(3, 6)}-${digitos.slice(6)}`;
}

function validarTelefono(value) {
  return soloDigitos(value).length === 10;
}

module.exports = { formatearTelefono, validarTelefono };
