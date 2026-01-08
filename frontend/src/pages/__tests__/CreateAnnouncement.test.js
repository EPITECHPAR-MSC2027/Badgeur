import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateAnnouncement from '../CreateAnnouncement';
import announcementService from '../../services/announcementService';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock announcementService
jest.mock('../../services/announcementService');

describe('CreateAnnouncement Component', () => {
    let localStorageMock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockClear();
        jest.useFakeTimers();

        // Setup localStorage mock
        localStorageMock = {
            getItem: jest.fn((key) => {
                if (key === 'userId') return '1';
                return null;
            }),
            setItem: jest.fn(),
            clear: jest.fn(),
            removeItem: jest.fn(),
            length: 0,
            key: jest.fn(),
        };
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    // Test 1: Component renders successfully with all elements
    test('Renders create announcement page with all elements', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('create-announcement-page')).toBeInTheDocument();
    });

    // Test 2: Page title is displayed correctly
    test('Displays page title correctly', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('page-title')).toBeInTheDocument();
    });

    // Test 3: Page description is displayed correctly
    test('Displays page description correctly', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('page-description')).toBeInTheDocument();
    });

    // Test 4: Header section is rendered
    test('Renders header section', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('header-section')).toBeInTheDocument();
    });

    // Test 5: Icon container is present
    test('Renders icon container', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('icon-container')).toBeInTheDocument();
    });

    // Test 6: Form section is rendered
    test('Renders form section', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('form-section')).toBeInTheDocument();
    });

    // Test 7: Title input field is rendered
    test('Renders title input field', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('title-input')).toBeInTheDocument();
    });

    // Test 8: Title input accepts user input
    test('Title input accepts user input', () => {
        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        fireEvent.change(titleInput, { target: { value: 'Test Title' } });

        expect(titleInput.value).toBe('Test Title');
    });

    // Test 9: Title character count updates correctly
    test('Title character count updates correctly', () => {
        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        fireEvent.change(titleInput, { target: { value: 'Test' } });

        expect(screen.getByTestId('title-char-count').textContent).toContain('4/100');
    });

    // Test 10: Title input has maxLength attribute set to 100
    test('Title input has maxLength attribute set to 100', () => {
        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');

        expect(titleInput).toHaveAttribute('maxLength', '100');
    });

    // Test 11: Message textarea is rendered
    test('Renders message textarea', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('message-input')).toBeInTheDocument();
    });

    // Test 12: Message textarea accepts user input
    test('Message textarea accepts user input', () => {
        render(<CreateAnnouncement />);

        const messageInput = screen.getByTestId('message-input');
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        expect(messageInput.value).toBe('Test Message');
    });

    // Test 13: Message character count updates correctly
    test('Message character count updates correctly', () => {
        render(<CreateAnnouncement />);

        const messageInput = screen.getByTestId('message-input');
        fireEvent.change(messageInput, { target: { value: 'Test message content' } });

        expect(screen.getByTestId('message-char-count').textContent).toContain('20/1000');
    });

    // Test 14: Message textarea has maxLength attribute set to 1000
    test('Message textarea has maxLength attribute set to 1000', () => {
        render(<CreateAnnouncement />);

        const messageInput = screen.getByTestId('message-input');

        expect(messageInput).toHaveAttribute('maxLength', '1000');
    });

    // Test 15: Submit button is rendered
    test('Renders submit button', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    // Test 16: Submit button is enabled by default
    test('Submit button is enabled by default', () => {
        render(<CreateAnnouncement />);

        const submitButton = screen.getByTestId('submit-button');

        expect(submitButton).not.toBeDisabled();
    });

    // Test 17: Shows error when submitting without title
    test('Shows error when submitting without title', async () => {
        render(<CreateAnnouncement />);

        const messageInput = screen.getByTestId('message-input');
        fireEvent.change(messageInput, { target: { value: 'Test message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });
    });

    // Test 18: Error feedback has correct type attribute
    test('Error feedback has correct type attribute', async () => {
        render(<CreateAnnouncement />);

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
        });
    });

    // Test 19: Shows error when submitting without message
    test('Shows error when submitting without message', async () => {
        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        fireEvent.change(titleInput, { target: { value: 'Test Title' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });
    });

    // Test 20: Shows error when userId is not in localStorage
    test('Shows error when userId is not in localStorage', async () => {
        localStorageMock.getItem.mockReturnValue(null);

        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
        });
    });

    // Test 21: Successfully creates announcement with valid data
    test('Successfully creates announcement with valid data', async () => {
        announcementService.createAnnouncement.mockResolvedValue({ id: 1 });

        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(announcementService.createAnnouncement).toHaveBeenCalledWith({
                title: 'Test Title',
                message: 'Test Message',
                authorId: 1
            });
        });
    });

    // Test 22: Shows success message after successful creation
    test('Shows success message after successful creation', async () => {
        announcementService.createAnnouncement.mockResolvedValue({ id: 1 });

        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'success');
        });
    });

    // Test 23: Clears form fields after successful submission
    test('Clears form fields after successful submission', async () => {
        announcementService.createAnnouncement.mockResolvedValue({ id: 1 });

        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(titleInput.value).toBe('');
        });

        expect(messageInput.value).toBe('');
    });

    // Test 24: Navigates to announcements page after successful submission
    test('Navigates to announcements page after successful submission', async () => {
        announcementService.createAnnouncement.mockResolvedValue({ id: 1 });

        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        // Wait for success feedback first
        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'success');
        });

        // Advance timers and flush promises
        jest.advanceTimersByTime(1500);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/announcements');
        });
    });

    // Test 25: Disables submit button during submission
    test('Disables submit button during submission', async () => {
        announcementService.createAnnouncement.mockImplementation(() => new Promise(() => { }));

        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });
    });

    // Test 26: Disables input fields during submission
    test('Disables input fields during submission', async () => {
        announcementService.createAnnouncement.mockImplementation(() => new Promise(() => { }));

        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(titleInput).toBeDisabled();
        });

        expect(messageInput).toBeDisabled();
    });

    // Test 27: Shows error message when API call fails
    test('Shows error message when API call fails', async () => {
        announcementService.createAnnouncement.mockRejectedValue(new Error('API Error'));

        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
        });
    });

    // Test 28: Re-enables submit button after API error
    test('Re-enables submit button after API error', async () => {
        announcementService.createAnnouncement.mockRejectedValue(new Error('API Error'));

        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
        });
    });

    // Test 29: Trims whitespace from title before submission
    test('Trims whitespace from title before submission', async () => {
        announcementService.createAnnouncement.mockResolvedValue({ id: 1 });

        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: '  Test Title  ' } });
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(announcementService.createAnnouncement).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Test Title'
                })
            );
        });
    });

    // Test 30: Trims whitespace from message before submission
    test('Trims whitespace from message before submission', async () => {
        announcementService.createAnnouncement.mockResolvedValue({ id: 1 });

        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: '  Test Message  ' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(announcementService.createAnnouncement).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Test Message'
                })
            );
        });
    });

    // Test 31: Shows error when title contains only whitespace
    test('Shows error when title contains only whitespace', async () => {
        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: '   ' } });
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
        });
    });

    // Test 32: Shows error when message contains only whitespace
    test('Shows error when message contains only whitespace', async () => {
        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: '   ' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
        });
    });

    // Test 33: Container element is rendered
    test('Renders container element', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('create-announcement-container')).toBeInTheDocument();
    });

    // Test 34: Title field container is rendered
    test('Renders title field container', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('title-field-container')).toBeInTheDocument();
    });

    // Test 35: Message field container is rendered
    test('Renders message field container', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('message-field-container')).toBeInTheDocument();
    });

    // Test 36: Title label is rendered
    test('Renders title label', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('title-label')).toBeInTheDocument();
    });

    // Test 37: Message label is rendered
    test('Renders message label', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('message-label')).toBeInTheDocument();
    });

    // Test 38: Feedback is cleared when submitting again
    test('Feedback is cleared when submitting again', async () => {
        render(<CreateAnnouncement />);

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });

        const titleInput = screen.getByTestId('title-input');
        fireEvent.change(titleInput, { target: { value: 'Test' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });
    });

    // Test 39: Console error is logged on API failure
    test('Console error is logged on API failure', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        announcementService.createAnnouncement.mockRejectedValue(new Error('API Error'));

        render(<CreateAnnouncement />);

        const titleInput = screen.getByTestId('title-input');
        const messageInput = screen.getByTestId('message-input');

        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        fireEvent.change(messageInput, { target: { value: 'Test Message' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    // Test 40: Character count shows zero initially
    test('Character count shows zero initially', () => {
        render(<CreateAnnouncement />);

        expect(screen.getByTestId('title-char-count').textContent).toContain('0/100');
        expect(screen.getByTestId('message-char-count').textContent).toContain('0/1000');
    });
});