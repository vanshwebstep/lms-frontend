import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', color: '#111', marginBottom: '20px' }}>
        Learn from the Best Coaches & Trainers
      </h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px', maxWidth: '80px', margin: '0 auto 40px auto' }}>
        A completely custom, ultra-modern Learning Management System designed tailored for premium mentorship, custom subscription modules, and tracking your professional growth.
      </p>
      
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '60px' }}>
        <Link to="/catalog" style={{ background: '#0070f3', color: '#fff', padding: '12px 30px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
          Explore Courses
        </Link>
        <Link to="/register" style={{ background: '#111', color: '#fff', padding: '12px 30px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
          Join as a Coach
        </Link>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #eaeaea', margin: '40px 0' }} />

      {/* Quick Feature Grid */}
      <h2 style={{ marginBottom: '30px' }}>Why Choose Our LMS?</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', textAlign: 'left' }}>
          <h3>Custom Subscriptions</h3>
          <p style={{ color: '#666' }}>Coaches can craft flexible single-tier or multi-tier custom dynamic packages for individual courses.</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', textAlign: 'left' }}>
          <h3>Quizzes & Content</h3>
          <p style={{ color: '#666' }}>Complete assessment ecosystem containing comprehensive quizzes, file assignments, and dynamic progress trackers.</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', textAlign: 'left' }}>
          <h3>Supervised Control</h3>
          <p style={{ color: '#666' }}>Full tracking metrics managed by dedicated custom Super Admin dashboards for safety and scale management.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
