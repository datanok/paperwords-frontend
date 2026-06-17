import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-message">Oops! Page not found</p>
        <p className="not-found-description">
          The page you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate('/')} variant="primary" size="lg">
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
