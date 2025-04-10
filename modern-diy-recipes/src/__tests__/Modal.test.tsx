import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../components/Modal';

describe('Modal component', () => {
  it('renders children when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div data-testid="modal-content">Hello Modal</div>
      </Modal>
    );
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div data-testid="modal-content">Hello Modal</div>
      </Modal>
    );
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });
});