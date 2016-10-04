/* global toastr FormData */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import b from 'b_';
import {TOKEN} from '../const.js';
import Form from '../components/form.jsx';
import ImageInfo from './image-info.jsx';

class ImagesUploadForm extends Form {
	constructor(props) {
		super(props);

		const {
			ext,
			width,
			height
		} = props;

		this.state = {
			isLoading: false,
			fields: {
				image: {
					label: 'Изображение',
					value: '',
					type: 'file',
					accept: 'image/*',
					required: true,
					help: (
						<ImageInfo
							{...{
								ext,
								width,
								height
							}}
							/>
					)
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	requestUpload() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const body = new FormData(this.form);

		let url = '/api/images/';
		if (this.props.exactSize) {
			const {width, height} = this.props;
			url += `?exact_width=${width}&exact_height=${height}`;
		}

		xhr({
			url,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			body
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 201: {
					this.resetForm();

					if (this.props.onSubmit) {
						this.props.onSubmit(JSON.parse(data));
					}

					break;
				}
				case 400: {
					this.processErrors(JSON.parse(data));
					break;
				}
				default: {
					toastr.danger('Не удалось загрузить изображение');
					break;
				}
			}
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestUpload();
	}

	render() {
		const form = ref => {
			this.form = ref;
		};

		return (
			<div className={b('images-upload-form')}>
				<div className="modal-body">
					<form
						ref={form}
						action=""
						onSubmit={this.handleClickSubmit}
						>
						{this.buildRow('image')}
					</form>
				</div>

				<div className="modal-footer">
					<button
						className="btn btn-default"
						data-dismiss="modal"
						type="button"
						>
						{'Отмена'}
					</button>

					<button
						className="btn btn-primary"
						onClick={this.handleClickSubmit}
						disabled={this.state.isLoading || !this.validate()}
						type="button"
						>
						{'Загрузить'}
					</button>
				</div>
			</div>
		);
	}
}
ImagesUploadForm.propTypes = {
	onSubmit: React.PropTypes.func.isRequired,
	width: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	height: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	ext: React.PropTypes.array,
	exactSize: React.PropTypes.bool
};
ImagesUploadForm.defaultProps = {
};

export default ImagesUploadForm;