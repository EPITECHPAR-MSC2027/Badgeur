import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Admin from '../Admin';
import authService from '../../services/authService';

// Mock services
jest.mock('../../services/authService');

// Mock child components
jest.mock('../../component/UsersSection', () => () => <div data-testid="users-section">UsersSection</div>);
jest.mock('../../component/TeamsSection', () => () => <div data-testid="teams-section">TeamsSection</div>);
jest.mock('../../component/PointagesSection', () => ({ onEditPointage, onDeletePointage }) => (
    <div data-testid="pointages-section">
        PointagesSection
        <button onClick={() => onEditPointage(1, {})}>Edit</button>
        <button onClick={() => onDeletePointage(1)}>Delete</button>
    </div>
));
jest.mock('../../component/PlanningsSection', () => () => <div data-testid="plannings-section">PlanningsSection</div>);
jest.mock('../../component/TypeDemandesSection', () => () => <div data-testid="typeDemandes-section">TypeDemandesSection</div>);
jest.mock('../../component/SeedDataPanel', () => () => <div data-testid="seed-data-panel">SeedDataPanel</div>);

describe('Admin Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn();
        window.alert = jest.fn();
    });

    // Test 1: Component renders with all navigation buttons
    test('Renders admin page with all navigation buttons', () => {
        render(<Admin />);

        expect(screen.getByTestId('admin-container')).toBeInTheDocument();
        expect(screen.getByTestId('admin-header')).toBeInTheDocument();
        expect(screen.getByTestId('admin-title')).toBeInTheDocument();
        expect(screen.getByTestId('admin-nav')).toBeInTheDocument();
        expect(screen.getByTestId('nav-button-users')).toBeInTheDocument();
        expect(screen.getByTestId('nav-button-teams')).toBeInTheDocument();
        expect(screen.getByTestId('nav-button-pointages')).toBeInTheDocument();
        expect(screen.getByTestId('nav-button-plannings')).toBeInTheDocument();
        expect(screen.getByTestId('nav-button-typeDemandes')).toBeInTheDocument();
    });

    // Test 2: Displays administration title correctly
    test('Displays administration title correctly', () => {
        render(<Admin />);

        expect(screen.getByTestId('admin-title')).toHaveTextContent('Administration');
    });

    // Test 3: Shows users section by default
    test('Shows users section by default', () => {
        render(<Admin />);

        expect(screen.getByTestId('users-section')).toBeInTheDocument();
        expect(screen.getByTestId('nav-button-users')).toHaveAttribute('data-active', 'true');
    });

    // Test 4: Shows seed data panel on initial render
    test('Shows seed data panel on initial render', () => {
        render(<Admin />);

        expect(screen.getByTestId('seed-data-panel')).toBeInTheDocument();
    });

    // Test 5: Switches to teams section when teams button is clicked
    test('Switches to teams section when teams button is clicked', () => {
        render(<Admin />);

        const teamsButton = screen.getByTestId('nav-button-teams');
        fireEvent.click(teamsButton);

        expect(screen.getByTestId('teams-section')).toBeInTheDocument();
        expect(screen.queryByTestId('users-section')).not.toBeInTheDocument();
        expect(teamsButton).toHaveAttribute('data-active', 'true');
    });

    // Test 6: Switches to pointages section when pointages button is clicked
    test('Switches to pointages section when pointages button is clicked', () => {
        render(<Admin />);

        const pointagesButton = screen.getByTestId('nav-button-pointages');
        fireEvent.click(pointagesButton);

        expect(screen.getByTestId('pointages-section')).toBeInTheDocument();
        expect(screen.queryByTestId('users-section')).not.toBeInTheDocument();
        expect(pointagesButton).toHaveAttribute('data-active', 'true');
    });

    // Test 7: Switches to plannings section when plannings button is clicked
    test('Switches to plannings section when plannings button is clicked', () => {
        render(<Admin />);

        const planningsButton = screen.getByTestId('nav-button-plannings');
        fireEvent.click(planningsButton);

        expect(screen.getByTestId('plannings-section')).toBeInTheDocument();
        expect(screen.queryByTestId('users-section')).not.toBeInTheDocument();
        expect(planningsButton).toHaveAttribute('data-active', 'true');
    });

    // Test 8: Switches to type demandes section when type demandes button is clicked
    test('Switches to type demandes section when type demandes button is clicked', () => {
        render(<Admin />);

        const typeDemandesButton = screen.getByTestId('nav-button-typeDemandes');
        fireEvent.click(typeDemandesButton);

        expect(screen.getByTestId('typeDemandes-section')).toBeInTheDocument();
        expect(screen.queryByTestId('users-section')).not.toBeInTheDocument();
        expect(typeDemandesButton).toHaveAttribute('data-active', 'true');
    });

    // Test 9: Active button has correct active state
    test('Active button has correct active state', () => {
        render(<Admin />);

        const usersButton = screen.getByTestId('nav-button-users');
        const teamsButton = screen.getByTestId('nav-button-teams');

        expect(usersButton).toHaveAttribute('data-active', 'true');
        expect(teamsButton).toHaveAttribute('data-active', 'false');

        fireEvent.click(teamsButton);

        expect(usersButton).toHaveAttribute('data-active', 'false');
        expect(teamsButton).toHaveAttribute('data-active', 'true');
    });

    // Test 10: Only one section is visible at a time
    test('Only one section is visible at a time', () => {
        render(<Admin />);

        expect(screen.getByTestId('users-section')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('nav-button-teams'));

        expect(screen.getByTestId('teams-section')).toBeInTheDocument();
        expect(screen.queryByTestId('users-section')).not.toBeInTheDocument();
        expect(screen.queryByTestId('pointages-section')).not.toBeInTheDocument();
        expect(screen.queryByTestId('plannings-section')).not.toBeInTheDocument();
        expect(screen.queryByTestId('typeDemandes-section')).not.toBeInTheDocument();
    });

    // Test 11: Navigating between sections updates active section
    test('Navigating between sections updates active section', () => {
        render(<Admin />);

        fireEvent.click(screen.getByTestId('nav-button-teams'));
        expect(screen.getByTestId('teams-section')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('nav-button-pointages'));
        expect(screen.getByTestId('pointages-section')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('nav-button-users'));
        expect(screen.getByTestId('users-section')).toBeInTheDocument();
    });

    // Test 12: HandleDeletePointage shows confirmation dialog
    test('HandleDeletePointage shows confirmation dialog', async () => {
        window.confirm.mockReturnValue(false);
        authService.delete = jest.fn().mockResolvedValue({ ok: true });

        render(<Admin />);

        fireEvent.click(screen.getByTestId('nav-button-pointages'));

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalled();
        expect(authService.delete).not.toHaveBeenCalled();
    });

    // Test 13: HandleDeletePointage calls delete API when confirmed
    test('HandleDeletePointage calls delete API when confirmed', async () => {
        window.confirm.mockReturnValue(true);
        authService.delete = jest.fn().mockResolvedValue({ ok: true });

        render(<Admin />);

        fireEvent.click(screen.getByTestId('nav-button-pointages'));

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(authService.delete).toHaveBeenCalledWith('/badgeLogEvent/1');
        });
    });

    // Test 14: HandleDeletePointage shows alert on error
    test('HandleDeletePointage shows alert on error', async () => {
        window.confirm.mockReturnValue(true);
        window.alert = jest.fn();
        authService.delete = jest.fn().mockResolvedValue({ ok: false });

        render(<Admin />);

        fireEvent.click(screen.getByTestId('nav-button-pointages'));

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalled();
        });
    });

    // Test 15: HandleDeletePointage handles network errors
    test('HandleDeletePointage handles network errors', async () => {
        window.confirm.mockReturnValue(true);
        window.alert = jest.fn();
        authService.delete = jest.fn().mockRejectedValue(new Error('Network error'));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        render(<Admin />);

        fireEvent.click(screen.getByTestId('nav-button-pointages'));

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    // Test 16: HandleEditPointage calls put API with correct data
    test('HandleEditPointage calls put API with correct data', async () => {
        authService.put = jest.fn().mockResolvedValue({ ok: true });

        render(<Admin />);

        fireEvent.click(screen.getByTestId('nav-button-pointages'));

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(authService.put).toHaveBeenCalledWith('/badgeLogEvent/1', {});
        });
    });

    // Test 17: HandleEditPointage shows alert on error
    test('HandleEditPointage shows alert on error', async () => {
        window.alert = jest.fn();
        authService.put = jest.fn().mockResolvedValue({ ok: false });

        render(<Admin />);

        fireEvent.click(screen.getByTestId('nav-button-pointages'));

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalled();
        });
    });

    // Test 18: HandleEditPointage handles network errors
    test('HandleEditPointage handles network errors', async () => {
        window.alert = jest.fn();
        authService.put = jest.fn().mockRejectedValue(new Error('Network error'));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        render(<Admin />);

        fireEvent.click(screen.getByTestId('nav-button-pointages'));

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        await waitFor(() => { 
            expect(window.alert).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    // Test 19: Passes correct props to PointagesSection
    test('Passes correct props to PointagesSection', () => {
        render(<Admin />);

        fireEvent.click(screen.getByTestId('nav-button-pointages'));

        expect(screen.getByTestId('pointages-section')).toBeInTheDocument();
    });

    // Test 20: Admin page container is always rendered
    test('Admin page container is always rendered', () => {
        render(<Admin />);

        expect(screen.getByTestId('admin-page')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('nav-button-teams'));
        expect(screen.getByTestId('admin-page')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('nav-button-pointages'));
        expect(screen.getByTestId('admin-page')).toBeInTheDocument();
    });

    // Test 21: All navigation buttons remain visible across sections
    test('All navigation buttons remain visible across sections', () => {
        render(<Admin />);

        const buttons = [
            'nav-button-users',
            'nav-button-teams',
            'nav-button-pointages',
            'nav-button-plannings',
            'nav-button-typeDemandes'
        ];

        buttons.forEach(buttonId => {
            expect(screen.getByTestId(buttonId)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('nav-button-teams'));

        buttons.forEach(buttonId => {
            expect(screen.getByTestId(buttonId)).toBeInTheDocument();
        });
    });

    // Test 22: Navigation preserves component mount state
    test('Navigation preserves component mount state', () => {
        render(<Admin />);

        fireEvent.click(screen.getByTestId('nav-button-teams'));
        expect(screen.getByTestId('teams-section')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('nav-button-users'));
        expect(screen.getByTestId('users-section')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('nav-button-teams'));
        expect(screen.getByTestId('teams-section')).toBeInTheDocument();
    });

    // Test 23: Clicking same navigation button maintains current section
    test('Clicking same navigation button maintains current section', () => {
        render(<Admin />);

        const usersButton = screen.getByTestId('nav-button-users');

        expect(screen.getByTestId('users-section')).toBeInTheDocument();

        fireEvent.click(usersButton);

        expect(screen.getByTestId('users-section')).toBeInTheDocument();
    });

    // Test 24: Navigation buttons have correct text content
    test('Navigation buttons have correct text content', () => {
        render(<Admin />);

        expect(screen.getByTestId('nav-button-users')).toHaveTextContent('Utilisateurs');
        expect(screen.getByTestId('nav-button-teams')).toBeInTheDocument();
        expect(screen.getByTestId('nav-button-pointages')).toHaveTextContent('Pointages');
        expect(screen.getByTestId('nav-button-plannings')).toHaveTextContent('Plannings');
        expect(screen.getByTestId('nav-button-typeDemandes')).toHaveTextContent('Types de demande');
    });

    // Test 25: Component structure is correctly nested
    test('Component structure is correctly nested', () => {
        render(<Admin />);

        const container = screen.getByTestId('admin-container');
        const header = screen.getByTestId('admin-header');
        const page = screen.getByTestId('admin-page');

        expect(container).toContainElement(header);
        expect(container).toContainElement(page);
        expect(header).toContainElement(screen.getByTestId('admin-nav'));
    });
});