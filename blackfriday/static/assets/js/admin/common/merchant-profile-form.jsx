/* global toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {HEAD_BASIS, TOKEN, ADVERTISER_INNER, ADVERTISER_IS_SUPERNOVA, ADVERTISER_INNER_VALUES} from '../const.js';
import {hasRole} from '../utils.js';
import Form from '../components/form.jsx';
import Checkbox from '../components/checkbox.jsx';

const PHONE_MASK = '+7 (111) 111-11-11';
const DEFAULT_BASIS = 0;

class MerchantProfileForm extends Form {
	constructor(props) {
		super(props);

		const isAdvertiser = hasRole('advertiser');
		const isSpecialAdvertiser = ADVERTISER_INNER || ADVERTISER_IS_SUPERNOVA;
		const isTokenExists = Boolean(props.token);

		const innerOptions = _.union(
			[{
				id: '',
				name: '- нет -'
			}],
			_.map(ADVERTISER_INNER_VALUES, inner => ({
				id: inner,
				name: inner
			}))
		);

		this.untouchableFields = ['name', 'contactName', 'contactPhone', 'inner', 'isSupernova'];
		this.neverRequiredFields = ['kpp', 'headName', 'headAppointment'];

		this.state = {
			isLoading: false,
			profileId: '',
			fields: {
				name: {
					label: 'Наименование юридического лица',
					value: '',
					required: true,
					excluded: true
				},
				contactName: {
					label: 'ФИО ответственного лица',
					value: '',
					required: true
				},
				contactPhone: {
					label: 'Сотовый тел. отв. лица',
					value: '',
					required: true,
					mask: PHONE_MASK
				},
				inner: {
					label: 'Особый признак',
					value: null,
					defaultValue: null,
					type: 'select',
					options: innerOptions,
					required: false,
					excluded: isAdvertiser || isTokenExists
				},
				isSupernova: {
					text: '«Сверхновая»',
					value: false,
					type: 'checkbox',
					excluded: isAdvertiser || isTokenExists
				},
				account: {
					label: 'Расчётный счёт',
					value: '',
					required: true,
					excluded: isSpecialAdvertiser
				},
				address: {
					label: 'Фактический адрес',
					value: '',
					required: true,
					excluded: isSpecialAdvertiser
				},
				bank: {
					label: 'Наименование банка',
					value: '',
					required: true,
					excluded: isSpecialAdvertiser
				},
				bik: {
					label: 'БИК',
					value: '',
					required: true,
					excluded: isSpecialAdvertiser
				},
				headAppointment: {
					label: 'Должность руководителя',
					value: '',
					required: false,
					excluded: isSpecialAdvertiser
				},
				headBasis: {
					label: 'На основании чего действует руководитель',
					value: DEFAULT_BASIS,
					defaultValue: DEFAULT_BASIS,
					valueType: 'Number',
					options: HEAD_BASIS,
					type: 'select',
					required: true,
					excluded: isSpecialAdvertiser
				},
				headName: {
					label: 'ФИО руководителя',
					value: '',
					required: false,
					excluded: isSpecialAdvertiser
				},
				inn: {
					label: 'ИНН',
					value: '',
					required: true,
					excluded: isSpecialAdvertiser
				},
				korr: {
					label: 'Корр. счёт',
					value: '',
					required: true,
					excluded: isSpecialAdvertiser
				},
				kpp: {
					label: 'КПП',
					value: '',
					required: false,
					excluded: isSpecialAdvertiser
				},
				legalAddress: {
					label: 'Юридический адрес',
					value: '',
					required: true,
					excluded: isSpecialAdvertiser
				}
			}
		};

		this.handleSpecialFields = this.handleSpecialFields.bind(this);
		this.handleClickSubmit = this.handleClickSubmit.bind(this);
		this.handleChangeInner = this.handleChangeInner.bind(this);
		this.handleChangeIsSupernova = this.handleChangeIsSupernova.bind(this);
	}

	componentDidMount() {
		const props = this.props;

		if (props.userName) {
			this.setState(previousState => {
				previousState.fields.name.value = props.userName;
				return previousState;
			});
		}

		if (props.isNew) {
			return;
		}

		this.requestProfileUser();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.userName) {
			this.setState(previousState => {
				previousState.fields.name.value = nextProps.userName;
				return previousState;
			});
		}

		if (nextProps.isNew) {
			return;
		}

		this.requestProfileUser();
	}

	handleSpecialFields(profile) {
		this.setState(prevState => {
			if (!profile.inner && !profile.isSupernova) {
				prevState.fields.inner.excluded = true;
				prevState.fields.isSupernova.excluded = true;
			} else if (profile.isSupernova) {
				prevState.fields.inner.excluded = true;
			} else {
				prevState.fields.isSupernova.excluded = true;
			}
			return prevState;
		});
	}

	// Get profile info
	requestProfileUser() {
		this.setState({isLoading: true});

		xhr({
			url: `/api/advertisers/${this.props.userId}/`,
			method: 'GET',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				const state = this.state;

				if (data) {
					if (data.id) {
						state.profileId = data.id;
					}

					if (data.profile) {
						Object.keys(state.fields).forEach(key => {
							const field = state.fields[key];
							let value = data.profile[key];
							if (_.isUndefined(value) || _.isNull(value)) {
								if (!_.isUndefined(field.defaultValue)) {
									value = field.defaultValue;
								}
							}
							field.value = value;

							const advertiserIsSpecial = data.profile.inner || data.profile.isSupernova;
							const fieldIsNullable = !_.includes(this.untouchableFields, key);

							if (advertiserIsSpecial && fieldIsNullable) {
								field.required = false;
								field.excluded = true;
							}
						});
						this.handleSpecialFields(data.profile);
					}

					if (data.name) {
						state.fields.name.value = data.name;
					}
				}

				this.forceUpdate();
			} else {
				toastr.error('Не удалось получить реквизиты рекламодателя');
			}
		});
	}

	// Update profile info
	requestProfileUserSave() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const fields = this.state.fields;
		const json = {
			name: fields.name.value,
			profile: this.serialize()
		};

		if (json.profile.inner === '') {
			json.profile.inner = null;
		}

		xhr({
			url: `/api/advertisers/${this.state.profileId}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				toastr.success('Реквизиты рекламодателя успешно обновлены');
				if (this.props.onSubmit) {
					this.props.onSubmit(data);
				}
			} else if (resp.statusCode === 400) {
				this.processErrors(data);
			} else {
				toastr.error('Не удалось обновить реквизиты рекламодателя');
			}
		});
	}

	// Create profile info
	requestProfileUserCreate() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const fields = this.state.fields;
		const json = {
			name: fields.name.value,
			profile: this.serialize()
		};

		if (json.profile.inner === '') {
			json.profile.inner = null;
		}

		xhr({
			url: `/api/advertisers/${this.props.userId}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				toastr.success('Реквизиты рекламодателя успешно обновлены');
				if (this.props.onSubmit) {
					this.props.onSubmit(data);
				}
			} else if (resp.statusCode === 400) {
				this.processErrors(data);
			} else {
				toastr.error('Не удалось обновить реквизиты рекламодателя');
			}
		});
	}

	requestUserRegistrationProfile() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const fields = this.state.fields;
		const json = {
			name: fields.name.value,
			profile: this.serialize()
		};

		if (json.profile.inner === '') {
			json.profile.inner = null;
		}

		xhr({
			url: `/api/registration/?token=${this.props.token}`,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (this.props.onSubmit) {
					this.props.onSubmit(data);
				}
			} else if (resp.statusCode === 400) {
				this.processErrors(data);
			} else {
				toastr.error('Не удалось обновить реквизиты рекламодателя');
			}
		});
	}

	handleChangeInner(value) {
		this.setState(prevState => {
			prevState.fields.inner.value = value;

			prevState.fields.isSupernova.value = false;
			prevState.fields.isSupernova.excluded = true;

			if (value) {
				prevState.fields.inner.excluded = false;
			}

			prevState.fields = _.mapValues(prevState.fields, (conf, field) => {
				if (!_.includes(this.untouchableFields, field)) {
					if (!_.includes(this.neverRequiredFields, field)) {
						conf.required = !value;
					}
					conf.excluded = Boolean(value);
				}
				return conf;
			});

			return prevState;
		});
	}

	handleChangeIsSupernova(value) {
		this.setState(prevState => {
			prevState.fields.isSupernova.value = value;

			prevState.fields.inner.value = null;
			prevState.fields.inner.excluded = true;

			if (value) {
				prevState.fields.isSupernova.excluded = false;
			}

			prevState.fields = _.mapValues(prevState.fields, (conf, field) => {
				if (!_.includes(this.untouchableFields, field)) {
					if (!_.includes(this.neverRequiredFields, field)) {
						conf.required = !value;
					}
					conf.excluded = value;
				}
				return conf;
			});

			return prevState;
		});
	}

	updateData(name, value) {
		super.updateData(name, value);

		if (name === 'inner') {
			this.handleChangeInner(value);
		}
	}

	handleClickSubmit(e) {
		e.preventDefault();

		if (this.props.token) {
			this.requestUserRegistrationProfile();
		} else if (this.props.isNew || this.state.profileId === '') {
			this.requestProfileUserCreate();
		} else {
			this.requestProfileUserSave();
		}
	}

	render() {
		const {profileId, isLoading} = this.state;
		const {userId, readOnly} = this.props;
		const isValid = this.validate();
		const isAdmin = hasRole('admin');
		const isSpecialAdvertiser = ADVERTISER_INNER || ADVERTISER_IS_SUPERNOVA;
		const showField = !(isSpecialAdvertiser || this.state.fields.inner.value || this.state.fields.isSupernova.value);

		return (
			<form
				action={`/profile/${profileId}`}
				method="POST"
				onSubmit={this.handleClickSubmit}
				>
				<input
					name="user_id"
					value={userId}
					type="hidden"
					/>

				{this.buildRow('name')}

				{(isAdmin && !this.state.fields.isSupernova.value) ? this.buildRow('inner') : null}

				{(isAdmin && !this.state.fields.inner.value) ? (
					<div className="form-group">
						<Checkbox
							text={this.state.fields.isSupernova.text}
							isChecked={this.state.fields.isSupernova.value}
							onChange={this.handleChangeIsSupernova}
							/>
					</div>
				) : null}

				{showField ? (
					<div className="form-group">
						<div className="row">
							{this.buildCol('bik')}
							{this.buildCol('inn')}
						</div>
					</div>
				) : null}

				{showField ? (
					<div className="form-group">
						<div className="row">
							{this.buildCol('kpp')}
							{this.buildCol('korr')}
						</div>
					</div>
				) : null}

				{showField ? this.buildRow('account') : null}
				{showField ? this.buildRow('bank') : null}

				{showField ? this.buildRow('address') : null}
				{showField ? this.buildRow('legalAddress') : null}

				{this.buildRow('contactName')}
				{this.buildRow('contactPhone')}

				{showField ? this.buildRow('headName') : null}
				{showField ? this.buildRow('headAppointment') : null}
				{showField ? this.buildRow('headBasis') : null}

				{readOnly ? null : (
					<div className="form-group">
						<button
							className="btn btn-primary"
							disabled={isLoading || !isValid}
							type="submit"
							>
							{'Сохранить'}
						</button>
					</div>
				)}
			</form>
		);
	}
}
MerchantProfileForm.propTypes = {
	userId: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]).isRequired,
	userName: React.PropTypes.string,
	token: React.PropTypes.string,
	isNew: React.PropTypes.bool
};
MerchantProfileForm.defaultProps = {
};

export default MerchantProfileForm;
