/* global window _ toastr */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable no-alert */

import React from 'react';
import xhr from 'xhr';
import Scroll from 'react-scroll';
import {TOKEN} from '../const.js';
import {processErrors} from '../utils.js';
import Invoice from './invoice.jsx';

const AdvertiserInvoiceList = React.createClass({
	propTypes: {
	},

	getInitialState() {
		return {
			invoices: [],
			activeInvoiceId: null
		};
	},

	componentDidMount() {
		xhr({
			url: '/api/invoices/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				if (data && Array.isArray(data)) {
					const invoices = _.sortBy(data, 'id').reverse();
					this.setState({invoices});
					this.scrollToActiveInvoice();
				}
			}
		});
	},

	scrollToActiveInvoice() {
		const hash = window.location.hash;

		if (/invoice/.test(hash)) {
			let activeInvoiceId = hash.split('invoice')[1];

			if (activeInvoiceId) {
				this.setState({activeInvoiceId});
				Scroll.scroller.scrollTo(`anchor-invoice-${activeInvoiceId}`, {
					offset: -35,
					smooth: true
				});
			}
		}
	},

	handleInvoiceCancel(id) {
		if (window.confirm('Аннулировать счёт?')) {
			this.requestCancel(id);
		}
	},

	requestCancel(id) {
		const json = {status: 2};

		xhr({
			url: `/api/invoices/${id}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			const {statusCode} = resp;

			if (statusCode >= 200 && statusCode < 300) {
				const invoice = this.getInvoiceById(id);
				invoice.status = 2;
				this.forceUpdate();
			} else if (statusCode === 400) {
				processErrors(data);
			} else {
				toastr.error('Не удалось аннулировать счёт');
			}
		});
	},

	getInvoiceById(id) {
		return _.find(this.state.invoices, {id});
	},

	render() {
		return (
			<div>
				{this.state.invoices.map(invoice => {
					return (
						<Invoice
							key={invoice.id}
							id={invoice.id}
							merchant={invoice.merchant}
							createdDatetime={invoice.createdDatetime}
							promo={invoice.promo}
							status={invoice.status}
							options={invoice.options}
							sum={invoice.sum}
							onCancel={this.handleInvoiceCancel}
							active={String(invoice.id) === this.state.activeInvoiceId}
							expiredDatetime={invoice.expiredDatetime}
							/>
					);
				})}
			</div>
		);
	}
});

export default AdvertiserInvoiceList;