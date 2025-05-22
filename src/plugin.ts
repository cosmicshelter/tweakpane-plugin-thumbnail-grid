import {
	BaseInputParams,
	BindingTarget,
	CompositeConstraint,
	createPlugin,
	InputBindingPlugin,
	parseRecord,
} from '@tweakpane/core';

import {PluginController} from './controller.js';

export interface ImageOption {
	label?: string;
	thumbnail: string;
}

export interface ImageOptions {
	[key: string]: ImageOption;
}

export interface PluginInputParams extends BaseInputParams {
	options: ImageOptions,
	height?: number;
	columns?: number;
	showLabel?: boolean,
	view: 'thumbnail-grid';
}

// NOTE: JSDoc comments of `InputBindingPlugin` can be useful to know details about each property
//
// `InputBindingPlugin<In, Ex, P>` means...
// - The plugin receives the bound value as `Ex`,
// - converts `Ex` into `In` and holds it
// - P is the type of the parsed parameters
//
export const PluginThumbnailList: InputBindingPlugin<
	string,
	string,
	PluginInputParams
> = createPlugin({
	id: 'thumbnail-grid',

	// type: The plugin type.
	// - 'input': Input binding
	// - 'monitor': Monitor binding
	// - 'blade': Blade without binding
	type: 'input',

	accept(exValue: unknown, params: Record<string, unknown>) {
		// Check if the external value is a string (since we're dealing with image keys)
		if (typeof exValue !== 'string') {
			// Return null to deny the user input
			return null;
		}

		// Parse parameters object
		const result = parseRecord<PluginInputParams>(params, (p) => ({
			// `view` option may be useful to provide a custom control for primitive values
			view: p.required.constant('thumbnail-grid'),

			// Create a custom parser for options that validates the ImageOptions structure
			options: p.required.custom<ImageOptions>((value) => {
				if (typeof value !== 'object' || value === null) {
					return undefined;
				}
				
				const options = value as Record<string, unknown>;
				const validatedOptions: ImageOptions = {};
				
				for (const [key, optionValue] of Object.entries(options)) {
					if (typeof optionValue !== 'object' || optionValue === null) {
						return undefined;
					}
					
					const option = optionValue as Record<string, unknown>;
					
					// Check that thumbnail exists and is a string
					if (typeof option.thumbnail !== 'string') {
						return undefined;
					}
					
					// Label is optional, but if it exists, it should be a string
					if (option.label !== undefined && typeof option.label !== 'string') {
						return undefined;
					}
					
					validatedOptions[key] = {
						thumbnail: option.thumbnail,
						label: option.label,
					};
				}
				
				return validatedOptions;
			}),
			height: p.optional.number,
			columns: p.optional.number,
			showLabel: p.optional.boolean,
		}));
		
		if (!result) {
			return null;
		}

		// Check if the initial value exists in the options
		if (!(exValue in result.options)) {
			return null;
		}

		// Return a typed value and params to accept the user input
		return {
			initialValue: exValue,
			params: result,
		};
	},

	binding: {
		reader(_args) {
			return (exValue: unknown): string => {
				// Convert an external unknown value into the internal value
				return typeof exValue === 'string' ? exValue : '';
			};
		},

		constraint(_args) {
			return new CompositeConstraint([]);
		},

		writer(_args) {
			return (target: BindingTarget, inValue: string) => {
				// Use `target.write()` to write the primitive value to the target
				target.write(inValue);
			};
		},
	},

	controller(args) {
		// Create a controller for the plugin
		return new PluginController(args.document, {
			value: args.value,
			viewProps: args.viewProps,
			options: args.params.options,
			height: args.params.height,
			columns: args.params.columns,
			showLabel: args.params.showLabel,
		});
	},
});
