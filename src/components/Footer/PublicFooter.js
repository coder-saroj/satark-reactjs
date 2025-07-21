import React from 'react';

const PublicFooter = () => {
  return (
    <footer className="bg-white text-dark p-2 mt-auto" style={{ height: '60px' }}>
      <div className="container h-100">
        <div className="row align-items-center h-100">
          {/* Jointly developed by, OSDMA and RIMES Logos */}
          <div className="col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <span className="me-3 text-muted" style={{ fontSize: '0.95rem' }}>Jointly developed by</span>
              <div className="d-flex align-items-center me-4">
                <img 
                  src="/assets/osdma_logo.png" 
                  alt="OSDMA Logo" 
                  className="me-2"
                  style={{ height: '30px', width: 'auto' }}
                />
                <span className="text-dark fw-bold">OSDMA</span>
              </div>
              <div className="d-flex align-items-center">
                <img 
                  src="/assets/rimes_logo.png" 
                  alt="RIMES Logo" 
                  className="me-2"
                  style={{ height: '30px', width: 'auto' }}
                />
                <span className="text-dark fw-bold">RIMES</span>
              </div>
            </div>
          </div>
          {/* Download Icons */}
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end align-items-center">
              <span className="me-3 text-muted">Download our app:</span>
              <a 
                href="#" 
                className="btn btn-outline-dark btn-sm me-2"
                title="Download for iOS"
              >
                <i className="fab fa-apple me-1"></i>
                iOS
              </a>
              <a 
                href="#" 
                className="btn btn-outline-dark btn-sm"
                title="Download for Android"
              >
                <i className="fab fa-google-play me-1"></i>
                Android
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
