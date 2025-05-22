import {
	constrainRange,
	Controller,
	PointerHandler,
	PointerHandlerEvent,
	Value,
	ViewProps,
} from '@tweakpane/core';

import { PluginView } from './view.js';
import { ImageOptions } from './plugin.js';

interface Config {
	value: Value<string>;
	viewProps: ViewProps;
	options: ImageOptions;
	height?: number;
	columns?: number;
	showLabel?: boolean;
}

// Custom controller class should implement `Controller` interface
export class PluginController implements Controller<PluginView> {
	public readonly value: Value<string>;
	public readonly view: PluginView;
	public readonly viewProps: ViewProps;
	public readonly options: ImageOptions;
	public readonly height: number  | undefined;
	public readonly columns: number  | undefined;
	public readonly showLabel: boolean | undefined;

	constructor(doc: Document, config: Config) {
		// Receive the bound value from the plugin
		this.value = config.value;
		this.options = config.options;
		this.height = config.height;
		this.columns = config.columns;
		this.showLabel = config.showLabel;

		// and also view props
		this.viewProps = config.viewProps;
		this.viewProps.handleDispose(() => {
			// Called when the controller is disposing
			this.removeEventListeners_();
		});

		// Create a custom view
		this.view = new PluginView(doc, {
			value: this.value,
			viewProps: this.viewProps,
			options: this.options,
			height: this.height,
			columns: this.columns,
			showLabel: this.showLabel,
		});

		// Bind
		this.bindAll_();

		// Events
		this.setupEventListeners_();
	}

	private bindAll_(): void {
		this.clickOptionHandler_ = this.clickOptionHandler_.bind(this);
	}

	private setupEventListeners_(): void {
		for (let i = 0; i < this.view.items.length; i++) {
			const item = this.view.items[i];
			item.addEventListener('click', this.clickOptionHandler_);
		}
	}

	private removeEventListeners_(): void {
		for (let i = 0; i < this.view.items.length; i++) {
			const item = this.view.items[i];
			item.removeEventListener('click', this.clickOptionHandler_);
		}
	}

	private clickOptionHandler_(e: MouseEvent): void {
		if (e.currentTarget) {
			const item = e.currentTarget as HTMLDivElement;
			const value = item.dataset.value;
			if (value) this.value.rawValue = value;
		}
	}
}
