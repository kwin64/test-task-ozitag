import App from './app';
import ButtonAddNewSelectComponent from './components/button-add-new-select-component';
import './style.scss';

function addNewComponent(): void {
    const appContainer = document.querySelector('.container') as HTMLElement;
    new App(appContainer);
}

window.onload = (): void => {
    const appContainer = document.querySelector('.container') as HTMLElement;

    if (!appContainer) throw Error('App root element not found');

    new App(appContainer);
    const addButton = new ButtonAddNewSelectComponent(appContainer);
    addButton.element.addEventListener('click', addNewComponent);
};