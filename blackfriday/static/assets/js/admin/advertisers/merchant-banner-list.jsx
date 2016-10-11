/* global document jQuery _ toastr */
/* eslint react/require-optimization: 0 */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';
import xhr from 'xhr';
import {BANNER_TYPE, TOKEN} from '../const.js';
import ImageInfo from '../common/image-info.jsx';
import MerchantBanner from './merchant-banner.jsx';
import MerchantBannerAddForm from './merchant-banner-add-form.jsx';

const className = 'merchant-banner-list';

class MerchantBannerList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			banners: []
		};

		this.handleClickBannerAdd = this.handleClickBannerAdd.bind(this);
		this.handleCheckOnMain = this.handleCheckOnMain.bind(this);
		this.handleCheckInMailing = this.handleCheckInMailing.bind(this);
		this.handleChangeUrl = this.handleChangeUrl.bind(this);
	}

	componentWillMount() {
		this.requestBanners();
	}

	requestBanners() {
		this.setState({isLoading: true});

		const {id} = this.props;

		xhr({
			url: `/api/merchants/${id}/banners/`,
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data) {
					this.setState({banners: data});
				}
			} else {
				toastr.error('Не удалось получить список баннеров');
			}
		});
	}

	requestBannerUpdate(bannerId, props) {
		this.setState({isLoading: true});

		const {id: merchantId} = this.props;

		let banner = this.getBannerById(bannerId);
		const json = _.pick(banner, ['type', 'url', 'onMain', 'inMailing', 'categories']);
		json.image = banner.image.id;
		_.merge(json, props);

		xhr({
			url: `/api/merchants/${merchantId}/banners/${bannerId}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data) {
					banner = this.getBannerById(bannerId);
					_.merge(banner, data);
					this.forceUpdate();
				}
			} else {
				toastr.error('Не удалось изменить баннер');
			}
		});
	}

	openMerchantBannerAddModal() {
		jQuery('#merchant-banner-add-modal').modal('show');
		const {availableBannerTypes, id} = this.props;
		const onSubmit = data => {
			jQuery('#merchant-banner-add-modal').modal('hide');
			this.merchantBannerAdd(data);
		};
		ReactDOM.render(
			<MerchantBannerAddForm
				{...{
					availableBannerTypes,
					id,
					onSubmit
				}}
				/>
			,
			document.getElementById('merchant-banner-add-form')
		);
	}

	handleClickBannerAdd() {
		this.openMerchantBannerAddModal();
	}

	handleCheckOnMain(id, isChecked) {
		this.requestBannerUpdate(id, {onMain: isChecked});
	}

	handleCheckInMailing(id, isChecked) {
		this.requestBannerUpdate(id, {inMailing: isChecked});
	}

	handleChangeUrl(id, value) {
		this.requestBannerUpdate(id, {url: value});
	}

	getBannerById(id) {
		return _.find(this.state.banners, {id});
	}

	merchantBannerAdd(data) {
		this.setState(previousState => {
			previousState.banners.push(data);
			return previousState;
		});
	}

	render() {
		const {banners} = this.state;
		const {availableBannerTypes} = this.props;

		return (
			<div className="shop-edit-block">
				<h2>
					{'Загрузить баннеры'}
				</h2>

				<div className="panel panel-default">
					<div className="panel-body">
						<div className="row">
							<div className="col-xs-12">
								<MerchantBannerAddPanel
									onClickAdd={this.handleClickBannerAdd}
									{...{
										availableBannerTypes
									}}
									/>

								<div className={className}>
									{banners.map(banner => (
										<div
											key={banner.id}
											className={b(className, 'item')}
											>
											<MerchantBanner
												onCheckOnMain={this.handleCheckOnMain}
												onCheckInMailing={this.handleCheckInMailing}
												onChangeUrl={this.handleChangeUrl}
												{...banner}
												/>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
MerchantBannerList.propTypes = {
	availableBannerTypes: React.PropTypes.array.isRequired,
	id: React.PropTypes.number.isRequired
};
MerchantBannerList.defaultProps = {
};

export default MerchantBannerList;

class MerchantBannerAddPanel extends React.Component {
	constructor(props) {
		super(props);
		this.handleClickAdd = this.handleClickAdd.bind(this);
	}

	handleClickAdd() {
		this.props.onClickAdd();
	}

	render() {
		const {availableBannerTypes} = this.props;

		return (
			<div className="merchant-banner-add-panel">
				<button
					className="btn btn-default"
					onClick={this.handleClickAdd}
					type="button"
					>
					{'Загрузить'}
				</button>

				<span className="merchant-banner-add-panel__info text-muted">
					{availableBannerTypes.map(item => (
						<BannerInfo
							key={item}
							type={item}
							/>
					))}
				</span>
			</div>
		);
	}
}
MerchantBannerAddPanel.propTypes = {
	availableBannerTypes: React.PropTypes.array.isRequired,
	onClickAdd: React.PropTypes.func.isRequired
};
MerchantBannerAddPanel.defaultProps = {
};

const BannerInfo = props => {
	const banner = BANNER_TYPE[props.type];
	const ext = ['png', 'jpg'];

	return (
		<ImageInfo
			label={banner.name}
			width={banner.width}
			height={banner.height}
			ext={ext}
			/>
	);
};
BannerInfo.propTypes = {
	type: React.PropTypes.number.isRequired
};
// BannerInfo.defaultProps = {};
