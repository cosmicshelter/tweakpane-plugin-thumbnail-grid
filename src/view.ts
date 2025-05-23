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
			
		}
		
		Object.assign(element.style, style);

		return element;
	}

	private createGridContainer_(doc: Document): HTMLDivElement {
		const container = doc.createElement('div');
		container.classList.add(className('grid-container'));

		const style = {
			'grid-template-columns': `repeat(${this.columns_}, 1fr)`,
			'max-height': `${this.height_}px`,
		}

		this.element.appendChild(container);

		Object.assign(container.style, style);

		return container;
	}

	private createMonitor_(doc: Document): HTMLDivElement {
		const monitor = doc.createElement('div');
		monitor.classList.add(className('main-monitor'));

		const styles = {}
		
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
			item: {},
			button: {},
			monitor: {},
		}

		// Create elements
		const item = document.createElement('div');
		const button = document.createElement('div');
		const monitor = document.createElement('div');
		const image = this.createThumbnail_(key, option);
		
		// Fill content
		item.dataset.value = key;
		monitor.innerHTML = option.label || key;
		button.setAttribute('title', option.label || key);
		
		// Apply style
		Object.assign(item.style, styles.item);
		Object.assign(button.style, styles.button);
		Object.assign(monitor.style, styles.monitor);

		// Apply class names
		item.classList.add(className('item'));
		button.classList.add(className('item__button'));
		monitor.classList.add(className('item__monitor'));
		
		// Append elements
		if (this.showLabel_) button.appendChild(monitor);
		button.appendChild(image);
		item.appendChild(button);
		this.container.appendChild(item);

		return item;
	}

	private createThumbnail_(key: string, option: ImageOption): HTMLImageElement | HTMLCanvasElement {
		if (typeof option.thumbnail === 'string') {
			const image = new Image();
			image.setAttribute('draggable', 'false');
			image.setAttribute('crossorigin', '*');

			image.src = option.thumbnail;
	
			const style = {};
			Object.assign(image.style, style);
	
			image.classList.add(className('item__image'));
	
			return image;
		}  else {
			const canvas = option.thumbnail;

			const style = {};
			Object.assign(canvas.style, style);

			canvas.classList.add(className('item__image'));

			return option.thumbnail;
		}
	}
}
