import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{ textAlign: 'center', padding: '8px 20px', marginTop: '80px' }}>
      <h1 style={{ fontSize: '72px', color: '#ff3366', margin: '0' }}>403</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>Access Denied / Restricted Area</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>You do not have permission to view this panel.</p>
      <Link to="/" style={{ background: '#111', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '5px' }}>
        Back to Safety (Home)
      </Link>
    </div>
  );
};

export default Unauthorized;
