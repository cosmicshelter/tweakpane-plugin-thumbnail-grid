import {ClassName, mapRange, Value, View, ViewProps} from '@tweakpane/core';
import { ImageOption, ImageOptions } from './plugin.js';

interface Config {
	value: Value<string>;
	viewProps: ViewProps;
	options: ImageOptions;
	height?: number;
	columns?: number;
	showLabel?: boolean;
}

// Create a class name generator from the view name
// ClassName('tmp') will generate a CSS class name like `tp-tmpv`
const className = ClassName('tmp');

// Custom view class should implement `View` interface
export class PluginView implements View {
	public readonly element: HTMLElement;
	public readonly container: HTMLElement;
	public readonly monitor: HTMLElement;
	public readonly items: Array<HTMLElement>;
	private value_: Value<string>;
	private options_: ImageOptions;
	private height_: number | undefined;
	private columns_: number | undefined;
	private showLabel_: boolean | undefined;

	constructor(doc: Document, config: Config) {
		// Receive the bound value from the controller
		this.value_ = config.value;

		// Options
		this.height_ = config.height;
		this.columns_ = config.columns;
		this.showLabel_ = config.showLabel;
		this.options_ = config.options;

		// Create a root element for the plugin
		this.element = this.createRootElement_(doc);
		this.monitor = this.createMonitor_(doc);
		this.container = this.createGridContainer_(doc);
		this.items = this.createOptions_(doc);

		// Bind view props to the element
		config.viewProps.bindClassModifiers(this.element);

		// Handle 'change' event of the value
		this.value_.emitter.on('change', this.onValueChange_.bind(this));

		// Apply the initial value
		this.refresh_();

		config.viewProps.handleDispose(() => {
			// Called when the view is disposing
			console.log('TODO: dispose view');
		});
	}

	private refresh_(): void {
		const rawValue = this.value_.rawValue;

		this.monitor.innerHTML = this.options_[rawValue].label || rawValue;

		// Check active
		for (let i = 0; i < this.items.length; i++) {
			const item = this.items[i];
			const isActive = item.dataset.value === rawValue;

			if (isActive && !item.classList.contains('is-active')) item.classList.add('is-active');
			else item.classList.remove('is-active');
		}
	}

	private onValueChange_() {
		this.refresh_();
	}

	private createRootElement_(doc: Document): HTMLDivElement {
		const element = doc.createElement('div');
		element.classList.add(className('thumbnail-grid'));

		const style = {
			'display': 'flex',
			'flex-direction': 'column',
		}
		
		Object.assign(element.style, style);

		return element;
	}

	private createGridContainer_(doc: Document): HTMLDivElement {
		const container = doc.createElement('div');
		container.classList.add(className('grid-container'));

		const style = {
			'display': 'grid',
			'grid-template-rows': 'auto',
			'grid-template-columns': `repeat(${this.columns_}, 1fr)`,
			'max-height': `${this.height_}px`,
			'overflow': 'scroll',
			'row-gap': '3px',
			'column-gap': '3px',
		}

		this.element.appendChild(container);

		Object.assign(container.style, style);

		return container;
	}

	private createMonitor_(doc: Document): HTMLDivElement {
		const monitor = doc.createElement('div');
		monitor.classList.add(className('main-monitor'));

		const styles = {
			'width': '100%',
			'height': '100%',
			'white-space': 'nowrap',
		}
		
		Object.assign(monitor.style, styles);

		this.element.appendChild(monitor);

		return monitor;
	}

	private createOptions_(doc: Document): Array<HTMLDivElement> {
		const elements = [];
		
		for (const key in this.options_) {
			const option = this.options_[key];
			const element = this.createOption_(doc, key, option);
			elements.push(element);
		}

		return elements;
	}

	private createOption_(doc: Document, key: string, option: ImageOption): HTMLDivElement {
		const styles = {
			container: {
				'position': 'relative',
				'width': '100%',
			},
			button: {
				'position': 'relative',
				'height': 'auto',
			},
			monitor: {
				'position': 'absolute',
				'left': '0',
				'bottom': '3px',
				'width': '100%',
				'padding': '5px 5px',
				'box-sizing': 'border-box',
				'overflow': 'hidden',
			},
			image: {
				'width': '100%',
				'height': 'auto',
			}
		}

		// Create elements
		const container = document.createElement('div');
		const button = document.createElement('div');
		const monitor = document.createElement('div');
		const image = new Image();
		image.setAttribute('draggable', 'false');
		
		// Fill content
		container.dataset.value = key;
		image.src = option.thumbnail;
		monitor.innerHTML = option.label || key;
		button.setAttribute('title', option.label || key);
		
		// Apply style
		Object.assign(container.style, styles.container);
		Object.assign(button.style, styles.button);
		Object.assign(monitor.style, styles.monitor);
		Object.assign(image.style, styles.image);

		// Apply class names
		container.classList.add(className('item'));
		image.classList.add(className('image'));
		button.classList.add(className('button'));
		monitor.classList.add(className('monitor'));
		
		// Append elements
		if (this.showLabel_) button.appendChild(monitor);
		button.appendChild(image);		
		container.appendChild(button);
		this.container.appendChild(container);

		return container;
	}
}
