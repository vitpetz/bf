import React from 'react';
import b from 'b_';
import MultiselectTwoSides from 'react-multiselect-two-sides';
import {BANNER_TYPE} from '../const.js';
import ControlLabel from '../components/control-label.jsx';
import Checkbox from '../components/checkbox.jsx';
import FormHorizontalRow from '../components/form-horizontal-row.jsx';
import ImagesUpload from '../common/images-upload.jsx';
import UTMWarningIcon from '../common/utm-warning-icon.jsx';
import Glyphicon from '../components/glyphicon.jsx';

const className = 'merchant-banner';

class MerchantBanner extends React.Component {
	constructor(props) {
		super(props);

		this.handleCheckOnMain = this.handleCheckOnMain.bind(this);
		this.handleCheckInMailing = this.handleCheckInMailing.bind(this);
		this.handleChangeUrl = this.handleChangeUrl.bind(this);
		this.handleChangeCategories = this.handleChangeCategories.bind(this);
		this.handleUploadImage = this.handleUploadImage.bind(this);
		this.handleClickDelete = this.handleClickDelete.bind(this);
	}

	handleCheckOnMain(isChecked) {
		this.props.onCheckOnMain(this.props.id, isChecked);
	}

	handleCheckInMailing(isChecked) {
		this.props.onCheckInMailing(this.props.id, isChecked);
	}

	handleChangeUrl(e) {
		this.props.onChangeUrl(this.props.id, e.target.value);
	}

	handleChangeCategories(value) {
		this.props.onChangeCategories(this.props.id, value);
	}

	handleUploadImage(image) {
		this.props.onUploadImage(this.props.id, image);
	}

	handleClickDelete() {
		this.props.onClickDelete(this.props.id);
	}

	render() {
		const {
			categoriesAvailable,
			categories,
			image,
			inMailing,
			limits,
			onMain,
			type,
			url
		} = this.props;
		const banner = BANNER_TYPE[type];
		const selectedCategories = categories.map(item => item.id);

		const showInMailing = limits.inMailing || limits.inMailing === 0;
		const disabledInMailing = limits.inMailing === 0 && !inMailing;

		const showOnMain = type !== 20 && (limits.onMain || limits.onMain === 0);
		const disabledOnMain = limits.onMain === 0 && !onMain;

		const showCategories = type !== 20;

		return (
			<div className={className}>
				<div className={b(className, 'content')}>
					<div className="row">
						<div className="col-xs-4">
							<div className={b(className, 'preview')}>
								<img
									className="img-responsive"
									src={image.url}
									alt=""
									/>

								<ImagesUpload
									onUpload={this.handleUploadImage}
									ext={['png', 'jpg']}
									width={banner.width}
									height={banner.height}
									exactSize
									/>

								<span
									className={b(className, 'remove')}
									onClick={this.handleClickDelete}
									title="Удалить баннер"
									>
									<Glyphicon name="remove"/>
								</span>
							</div>
						</div>

						{showOnMain || showInMailing || showCategories ? (
							<div className="col-xs-2">
								<ControlLabel name="Показывать"/>

								{showOnMain ? (
									<Checkbox
										name="onMain"
										text="На главной"
										isChecked={onMain}
										onChange={this.handleCheckOnMain}
										disabled={disabledOnMain}
										/>
								) : null}

								{showInMailing ? (
									<Checkbox
										name="inMailing"
										text="В рассылке"
										isChecked={inMailing}
										onChange={this.handleCheckInMailing}
										disabled={disabledInMailing}
										/>
								) : null}
							</div>
						) : null}

						{showCategories ? (
							<div className="col-xs-6">
								<MultiselectTwoSides
									onChange={this.handleChangeCategories}
									clearFilterText="Очистить"
									availableHeader="Доступные"
									selectedHeader="Выбранные"
									selectAllText="Выбрать все"
									deselectAllText="Очистить"
									options={categoriesAvailable}
									value={selectedCategories}
									limit={limits.categories}
									labelKey="name"
									valueKey="id"
									showControls
									searchable
									/>
							</div>
						) : null}
					</div>
				</div>

				<div className={b(className, 'footer')}>
					<div className="form-horizontal">
						<FormHorizontalRow
							label={(
								<span>
									<UTMWarningIcon value={url}/>
									{'URL'}
								</span>
							)}
							name="url"
							onChange={this.handleChangeUrl}
							value={url}
							type="url"
							changeOnBlur
							/>
					</div>
				</div>
			</div>
		);
	}
}
MerchantBanner.propTypes = {
	categories: React.PropTypes.array,
	categoriesAvailable: React.PropTypes.array,
	id: React.PropTypes.number,
	image: React.PropTypes.object,
	inMailing: React.PropTypes.bool,
	limits: React.PropTypes.object,
	onChangeCategories: React.PropTypes.func,
	onChangeUrl: React.PropTypes.func,
	onCheckInMailing: React.PropTypes.func,
	onCheckOnMain: React.PropTypes.func,
	onClickDelete: React.PropTypes.func,
	onMain: React.PropTypes.bool,
	onUploadImage: React.PropTypes.func,
	type: React.PropTypes.number,
	url: React.PropTypes.string
};
MerchantBanner.defaultProps = {
};

export default MerchantBanner;
