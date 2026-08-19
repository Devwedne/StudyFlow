import { Navigate } from 'react-router'

function ProtectedRoute({ usuario, children }) {
  return usuario ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
