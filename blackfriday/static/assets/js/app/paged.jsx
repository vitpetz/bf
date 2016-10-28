import React from 'react';
import LoadMore from './load-more.jsx';
import Pager from './pager.js';

class Paged extends React.Component {
	constructor() {
		super();
		this.state = {
			data: [],
			isAllLoaded: false,
			isInited: false,
			isLoading: false,
			page: null
		};

		this.handleClick = this.handleClick.bind(this);
	}

	componentDidMount() {
		const props = this.props;

		this.pager = new Pager({
			perPage: props.perPage,
			pagesCount: props.pages,
			loadPagesCount: props.loadPagesCount,
			isCycled: false,
			isRandom: props.isRandom,
			ajaxUrl: props.ajaxUrl,
			onNext: (data, page) => {
				this.handleNext(data, page);
			},
			onAllLoaded: () => {
				this.setState({
					isAllLoaded: true
				});
			},
			onLoadstart: () => {
				this.setState({
					isLoading: true
				});
			},
			onLoadend: () => {
				this.setState({
					isLoading: false
				});
			},
			onInited: () => {
				this.setState({
					isInited: true
				});
			}
		});
	}

	handleNext(data, page) {
		data = this.state.data.concat(data);
		this.setState({
			data,
			page
		}, () => {
			this.props.onNext(data);
		});
	}

	handleClick() {
		this.pager.next();
	}

	render() {
		if (this.state.isInited) {
			return (
				<div className="special-offers">
					{this.props.children}

					{this.state.isAllLoaded ? null : (
						<LoadMore
							key={this.state.page}
							onClick={this.handleClick}
							text={this.props.loadMoreText}
							disabled={this.state.isLoading}
							/>
					)}
				</div>
			);
		}

		return (<div/>);
	}
}
Paged.propTypes = {
	ajaxUrl: React.PropTypes.string,
	ajaxUrlRoot: React.PropTypes.bool,
	children: React.PropTypes.element,
	className: React.PropTypes.string,
	data: React.PropTypes.array,
	isRandom: React.PropTypes.bool,
	loadMoreText: React.PropTypes.string,
	loadPagesCount: React.PropTypes.number,
	onNext: React.PropTypes.func,
	pages: React.PropTypes.number,
	pagesCount: React.PropTypes.number,
	perPage: React.PropTypes.number,
	speed: React.PropTypes.number
};

export default Paged;
