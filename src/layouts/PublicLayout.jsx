import { Link, Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header/Navbar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 30px', background: '#fff', borderBottom: '1px solid #eee', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>ModernLMS</Link>
        <nav style={{ display: 'flex', gap: '20px' }}>
          <Link to="/catalog" style={{ textDecoration: 'none', color: '#666' }}>Browse Courses</Link>
          <Link to="/login" style={{ textDecoration: 'none', color: '#0070f3', fontWeight: '500' }}>Login</Link>
          <Link to="/register" style={{ background: '#0070f3', color: '#fff', padding: '8px 16px', borderRadius: '5px', textDecoration: 'none' }}>Register</Link>
        </nav>
      </header>

      {/* Dynamic Content */}
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '20px', background: '#f9f9f9', borderTop: '1px solid #eee' }}>
        <p>&copy; 2026 ModernLMS Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PublicLayout;
