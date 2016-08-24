/* eslint react/require-optimization: 0 */

import React from 'react';
import arrayShuffle from 'array-shuffle';
import {resolveImgPath} from './utils.js';
import Carousel from './carousel.jsx';
import Link from './link.jsx';

class Banner extends React.Component {
	render() {
		const item = this.props.data;
		let url = item.url;
		let isExternal = false;
		if (item.url === '/merchant/') {
			url = item.merchant_url;
			isExternal = true;
		}
		return (
			<Link
				href={url}
				className="party-carousel-content__image-placeholder embed-responsive"
				isExternal={isExternal}
				>
				<img className="party-carousel-content__image embed-responsive-item" src={resolveImgPath(item.logo)} alt=""/>
			</Link>
		);
	}
}
Banner.propTypes = {
	data: React.PropTypes.object
};

class BannerPlaceholder extends React.Component {
	render() {
		return (
			<span className="party-carousel-content__image-placeholder embed-responsive">
				<img className="party-carousel-content__image embed-responsive-item" src="/static/images/banner-placeholder.png" alt=""/>
			</span>
		);
	}
}

class MerchantsCarousel extends React.Component {
	render() {
		const {list, perPage, pages} = this.props;
		const length = list.length;
		let i = length;
		const l = list.map((item, index) => (
			<div
				key={`${index}${item.logo}`}
				className="party-carousel-content__item"
				>
				<Banner data={item}/>
			</div>
		));
		let additional = perPage;
		if (pages === 1 && length <= 4) {
			additional = 4;
		}
		while (i++ < additional) {
			l.push(
				<div
					key={i}
					className="party-carousel-content__item"
					>
					<BannerPlaceholder/>
				</div>
			);
		}
		return (
			<div className="party-carousel-content">
				{l}
			</div>
		);
	}
}
MerchantsCarousel.propTypes = {
	list: React.PropTypes.array,
	perPage: React.PropTypes.number,
	pages: React.PropTypes.number
};

export class Merchants extends React.Component {
	constructor() {
		super();
		this.state = {
			data: []
		};
		this.handleNext = this.handleNext.bind(this);
	}

	handleNext(data) {
		this.setState({
			data: arrayShuffle(data)
		});
	}

	render() {
		return (
			<div className="party-carousel">
				<Carousel
					onNext={this.handleNext}
					{...this.props}
					>
					<MerchantsCarousel
						list={this.state.data}
						perPage={this.props.perPage}
						pages={this.props.pages}
						/>
				</Carousel>
			</div>
		);
	}
}
Merchants.propTypes = {
	data: React.PropTypes.array,
	pages: React.PropTypes.number,
	perPage: React.PropTypes.number,
	pagesCount: React.PropTypes.number,
	loadPagesCount: React.PropTypes.number,
	isRandom: React.PropTypes.bool,
	isControlsShown: React.PropTypes.bool,
	isPagerShown: React.PropTypes.bool,
	ajaxUrl: React.PropTypes.string,
	ajaxUrlRoot: React.PropTypes.bool,
	speed: React.PropTypes.number,
	onNext: React.PropTypes.func,
	loadMoreText: React.PropTypes.string
};

export class AllMerchants extends React.Component {
	constructor(props) {
		super();
		this.state = {
			data: arrayShuffle(props.data || [])
		};
	}

	render() {
		let banners = this.state.data.map(function (item) {
			return (
				<div className="col-xs-6 all-merchants__item" key={`${item.logo}${item.url}`}>
					<Banner data={item}/>
				</div>
			);
		});

		return (
			<div className="all-merchants">
				<div className="row">
					{banners}
				</div>
			</div>
		);
	}
}
AllMerchants.propTypes = {
	data: React.PropTypes.array
};
