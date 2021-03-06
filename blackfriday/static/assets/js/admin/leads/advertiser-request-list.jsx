/* global moment */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import b from 'b_';
import {ENV} from '../const.js';
import {hasRole} from '../utils.js';
import {getApplicationStatusColor} from './utils.js';

const AdvertiserRequestList = React.createClass({
	getInitialState() {
		return {};
	},

	propTypes: {
		applications: React.PropTypes.array,
		onClickStatusChange: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleClickStatusChange(id, status) {
		this.props.onClickStatusChange(id, status);
	},

	render() {
		const {applications} = this.props;

		const className = 'advertiser-request-list';

		return (
			<div className={b(className)}>
				<table className={'table table-hover ' + b(className, 'table')}>
					<thead>
						<tr>
							<th className={b(className, 'table-th', {name: 'date'})}>
								{'Дата'}
							</th>

							<th className={b(className, 'table-th', {name: 'name'})}>
								{'Имя'}
							</th>

							<th className={b(className, 'table-th', {name: 'organization'})}>
								{'Организация'}
							</th>

							<th className={b(className, 'table-th', {name: 'contacts'})}>
								{'Контакты'}
							</th>

							<th className={b(className, 'table-th', {name: 'comment'})}>
								{'Комментарий'}
							</th>

							<th className={b(className, 'table-th', {name: 'manager'})}>
								{'Менеджер'}
							</th>

							<th className={b(className, 'table-th', {name: 'action'})}/>
						</tr>
					</thead>

					<tbody>
						{applications.map(item => {
							return (
								<AdvertiserRequestListItem
									key={item.id}
									onClickStatusChange={this.handleClickStatusChange}
									{...item}
									/>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
});

export default AdvertiserRequestList;

const AdvertiserRequestListItem = React.createClass({
	propTypes: {
		comment: React.PropTypes.string,
		createdDatetime: React.PropTypes.string,
		email: React.PropTypes.string,
		id: React.PropTypes.number,
		name: React.PropTypes.string,
		onClickStatusChange: React.PropTypes.func,
		organizationName: React.PropTypes.string,
		phone: React.PropTypes.string,
		status: React.PropTypes.number,
		// updatedDatetime: React.PropTypes.string,
		userResponsible: React.PropTypes.object
	},

	getDefaultProps() {
		return {};
	},

	handleClickStatusChange(e) {
		e.preventDefault();
		this.props.onClickStatusChange(this.props.id, parseInt(e.target.dataset.status, 10));
	},

	render() {
		const {
			comment,
			createdDatetime,
			email,
			name,
			organizationName,
			phone,
			status,
			userResponsible
		} = this.props;
		const className = 'advertiser-request-list';

		const isAdmin = hasRole('admin');
		const isOperator = hasRole('operator');
		const isMine = isAdmin || (userResponsible ? ENV.userId === userResponsible.id : false);
		const isActionVisible = isAdmin || isOperator;

		return (
			<tr className={b(className, 'table-tr') + getApplicationStatusColor(status, ' bg-')}>
				<td className={b(className, 'table-td', {name: 'date'})}>
					{moment(createdDatetime).format('DD.MM.YYYY')}
				</td>

				<td className={b(className, 'table-td', {name: 'name'})}>
					{name}
				</td>

				<td className={b(className, 'table-td', {name: 'organization'})}>
					{organizationName}
				</td>

				<td className={b(className, 'table-td', {name: 'contacts'})}>
					<a
						className={b(className, 'email')}
						href={`mailto:${email}`}
						title={email}
						>
						{email}
					</a>

					<br/>

					{phone}
				</td>

				<td className={b(className, 'table-td', {name: 'comment'})}>
					{comment}
				</td>

				<td className={b(className, 'table-td', {name: 'manager'})}>
					{userResponsible ? (
						userResponsible.displayName
					) : null}
				</td>

				<td className={b(className, 'table-td', {name: 'action'})}>
					{isActionVisible ? (
						<div>
							{status === 0 ? (
								<button
									className="btn btn-default btn-sm btn-block"
									onClick={this.handleClickStatusChange}
									data-status="10"
									type="button"
									>
									{'В работу'}
								</button>
							) : null}

							{status === 10 && isMine ? (
								<button
									className="btn btn-success btn-sm btn-block"
									onClick={this.handleClickStatusChange}
									data-status="20"
									type="button"
									>
									{'Участвует'}
								</button>
							) : null}

							{status === 10 && isMine ? (
								<button
									className="btn btn-danger btn-sm btn-block"
									onClick={this.handleClickStatusChange}
									data-status="30"
									type="button"
									>
									{'Отказ'}
								</button>
							) : null}
						</div>
					) : null}
				</td>
			</tr>
		);
	}
});
