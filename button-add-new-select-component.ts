/* eslint-disable no-param-reassign */
/* eslint-disable no-alert */
import ButtonsComponent from './components/buttons-component';
import HeaderComponent from './components/header-component';
import SelectComponent from './components/select-component';
import { IOptionItem } from './interfaces/option-interface';
import createHTMLElement from './utils/create-HTML-element';
import getOptionValue from './utils/get-option-value';

export default class App {
    private headerListComponent: HeaderComponent;

    private selectComponent: SelectComponent;

    private buttonsComponent: ButtonsComponent;

    private contentContainer: HTMLElement;

    private optionsListContainer: HTMLElement | null;

    private funcHandleClickApplyButton = this.handleClickApplyButton.bind(this);

    private funcHandleClickClearButton = this.handleClickClearButton.bind(this);

    public constructor(private readonly rootElement: HTMLElement) {
        this.contentContainer = document.createElement('div');
        this.contentContainer.classList.add('list-component');

        this.headerListComponent = new HeaderComponent();
        this.selectComponent = new SelectComponent();
        this.buttonsComponent = new ButtonsComponent();

        this.rootElement.append(this.contentContainer);
        this.contentContainer.append(this.headerListComponent.element);
        this.contentContainer.append(this.selectComponent.element);
        this.optionsListContainer = null;
        this.addListenersToSelect();
        this.setCheckedOption();
    }

    private setCheckedOption(): void {
        this.headerListComponent.countCheckedOptions = this.selectComponent.checkedOptions.size;
        this.headerListComponent.setNewValueInCountElement();
        this.headerListComponent.hideInformationIfSelectedEmpty();
    }

    private addListenersToSelect(): void {
        (this.selectComponent.element.querySelector('select') as HTMLSelectElement).addEventListener(
            'click',
            this.showOptionsListOnScreen.bind(this)
        );
        (this.headerListComponent.element.querySelector('.selected-elements') as HTMLSelectElement).addEventListener(
            'click',
            this.setAllOptionIsShowAndShowOnScreen.bind(this)
        );
    }

    private setAllOptionIsShowAndShowOnScreen(): void {
        const allOptionsInShownMode = this.selectComponent.allOptionsItems.map((option) => {
            const updatedOptionElem = option;
            updatedOptionElem.isShown = true;
            updatedOptionElem.isOpen = true;

            return updatedOptionElem;
        });

        this.selectComponent.allOptionsItems = [...allOptionsInShownMode];

        this.showOptionsListOnScreen();
    }

    private showOptionsListOnScreen(): void {
        const optionsList = this.selectComponent.getAllOptionsAsString();

        if (optionsList) {
            this.optionsListContainer = createHTMLElement('div', '', 'select-information-container') as HTMLElement;
            this.contentContainer.append(this.optionsListContainer);
            this.optionsListContainer.addEventListener('click', this.setCheckedOptionHandleClick.bind(this));
            this.optionsListContainer.innerHTML = optionsList;
            this.contentContainer.append(this.buttonsComponent.element);
            this.addListenersToButtons();
        } else {
            this.optionsListContainer?.removeEventListener('click', this.setCheckedOptionHandleClick.bind(this));
            this.optionsListContainer?.remove();

            this.removeListenersToButtons();
            this.buttonsComponent.element.remove();
        }
    }

    private addListenersToButtons(): void {
        this.buttonsComponent.element
            .querySelector('.button-apply')
            ?.addEventListener('click', this.funcHandleClickApplyButton);
        this.buttonsComponent.element
            .querySelector('.button-clear')
            ?.addEventListener('click', this.funcHandleClickClearButton);
    }

    private removeListenersToButtons(): void {
        this.buttonsComponent.element
            .querySelector('.button-apply')
            ?.removeEventListener('click', this.funcHandleClickApplyButton);
        this.buttonsComponent.element
            .querySelector('.button-clear')
            ?.removeEventListener('click', this.funcHandleClickClearButton);
    }

    private handleClickApplyButton(): void {
        alert(`Следующие выбранные элементы - ${[...this.selectComponent.checkedOptions].join(', ')} - приняты`);
        this.selectComponent.isShownOptions = false;
        this.optionsListContainer?.removeEventListener('click', this.setCheckedOptionHandleClick.bind(this));
        this.optionsListContainer?.remove();

        this.removeListenersToButtons();
        this.buttonsComponent.element.remove();
    }

    private clearCheckedOptions(): void {
        const inputsList = [...this.contentContainer.querySelectorAll('input')];
        inputsList.forEach((input) => {
            input.checked = false;
        });

        const labelsList = [...this.contentContainer.querySelectorAll('label')];
        labelsList.forEach((label) => {
            label.classList.remove('background-selected-option');
        });
    }

    private clearCheckedOptionsFromHeaderComponent(): void {
        this.selectComponent.checkedOptions.clear();
        this.headerListComponent.countCheckedOptions = 0;
        this.headerListComponent.setNewValueInCountElement();
    }

    private handleClickClearButton(): void {
        this.clearCheckedOptions();
        this.clearCheckedOptionsFromHeaderComponent();
    }

    private setCheckedOptionHandleClick(event: MouseEvent): void {
        const clickTarget = event.target as HTMLLabelElement;

        if (clickTarget.localName === 'span') {
            event.preventDefault();

            return;
        }

        if (clickTarget.classList.contains('arrow-up')) {
            const optionValue = getOptionValue(clickTarget);

            if (clickTarget.classList.contains('arrow-down')) {
                this.setShownOptionsList(optionValue, true);
                event.preventDefault();

                return;
            }

            this.setShownOptionsList(optionValue, false);
            event.preventDefault();

            return;
        }

        if (clickTarget.localName === 'label') {
            clickTarget.classList.toggle('background-selected-option');
            this.checkedOptionListItem(clickTarget);
        }
    }

    private setShownOptionsList(optionValue: string, isOpen: boolean): void {
        const optionsList = [...this.selectComponent.allOptionsItems];
        const updatedOptionsList = optionsList.map((element) => {
            if (element.dataValue === optionValue) {
                const updatedElem = element;
                updatedElem.isOpen = isOpen;

                return element;
            }

            return element;
        });

        const clickedOptionItem = updatedOptionsList.find((element) => element.dataValue === optionValue) as IOptionItem;

        this.setChildrenIsOptionsList(clickedOptionItem, optionsList, isOpen);
        this.selectComponent.isShownOptions = false;
        this.optionsListContainer?.remove();
        this.showOptionsListOnScreen();
    }

    private setChildrenIsOptionsList(optionItem: IOptionItem, optionsList: IOptionItem[], value: boolean): void {
        const updatedOptionsList = optionsList.map((elem, index) => {
            optionItem.childrenIndex?.forEach((childrenIndex) => {
                if (childrenIndex === index) {
                    elem.isShown = value;
                    elem.isOpen = true;
                }
            });

            return elem;
        });

        this.selectComponent.allOptionsItems = [...updatedOptionsList];
    }

    private checkedOptionListItem(clickTarget: HTMLLabelElement): void {
        const optionValue = getOptionValue(clickTarget);

        this.selectComponent.allOptionsItems = this.selectComponent.allOptionsItems.map((element) => {
            if (optionValue === element.dataValue) {
                element.isChecked = !element.isChecked;
            }

            return element;
        });

        if (this.selectComponent.isOptionInCheckedList(optionValue)) {
            this.selectComponent.removeCheckedOption(optionValue);
            this.headerListComponent.countCheckedOptions -= 1;
        } else {
            this.selectComponent.addCheckedOption(optionValue);
            this.headerListComponent.countCheckedOptions += 1;
        }

        this.headerListComponent.setNewValueInCountElement();
    }
}