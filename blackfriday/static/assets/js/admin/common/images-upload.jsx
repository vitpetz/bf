/* global document jQuery */

import React from 'react';
import ReactDOM from 'react-dom';
import ImagesUploadForm from './images-upload-form.jsx';
import ImageInfo from './image-info.jsx';

class ImagesUpload extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false
		};

		this.handleClickModalOpen = this.handleClickModalOpen.bind(this);
	}

	modalOpen() {
		const {exactSize, ext, onUpload, width, height} = this.props;
		const modal = jQuery('#images-upload-modal');
		const openedModals = jQuery('.modal.in');
		if (openedModals.length) {
			openedModals.one('hidden.bs.modal', () => {
				modal.modal('show');
			});
			openedModals.modal('hide');
			modal.one('hidden.bs.modal', () => {
				openedModals.modal('show');
			});
		} else {
			modal.modal('show');
		}

		const onSubmit = data => {
			modal.modal('hide');
			onUpload(data);
		};
		ReactDOM.render(
			<ImagesUploadForm
				{...{
					exactSize,
					ext,
					onSubmit,
					width,
					height
				}}
				/>
			,
			document.getElementById('images-upload-form')
		);
	}

	handleClickModalOpen() {
		this.modalOpen();
	}

	render() {
		const {
			ext,
			width,
			height,
			size
		} = this.props;

		return (
			<div className="">
				<button
					className={`btn btn-default${size ? ` btn-${size}` : ''}`}
					onClick={this.handleClickModalOpen}
					type="button"
					>
					{'Загрузить'}
				</button>

				<ImageInfo
					{...{
						ext,
						width,
						height
					}}
					/>
			</div>
		);
	}
}
ImagesUpload.propTypes = {
	exactSize: React.PropTypes.bool,
	ext: React.PropTypes.array,
	height: React.PropTypes.oneOfType([
		React.PropTypes.number,
		React.PropTypes.string
	]),
	width: React.PropTypes.oneOfType([
		React.PropTypes.number,
		React.PropTypes.string
	]),
	onUpload: React.PropTypes.func.isRequired,
	size: React.PropTypes.oneOf([
		'lg',
		'sm',
		'xs'
	])
};
ImagesUpload.defaultProps = {
};

export default ImagesUpload;
