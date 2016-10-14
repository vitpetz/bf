/* global toastr _ jQuery */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint react/require-optimization: 0 */

import React from 'react';
import xhr from 'xhr';
import Price from 'react-price';
import {TOKEN} from '../const.js';
import {formatPrice, processErrors} from '../utils.js';
import Select from '../components/select.jsx';
import EditableCell from './editable-cell.jsx';
import Popover from '../components/popover.jsx';
import Glyphicon from '../components/glyphicon.jsx';

const FEED_CELL = {
	name: 'Название',
	url: 'URL',
	startPrice: 'Цена от',
	oldPrice: 'Старая цена',
	price: 'Цена',
	discount: 'Скидка',
	country: 'Страна производства',
	brand: 'Производитель',
	category: 'Категория',
	image: 'Картинка'
};

class ProductsNewTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			products: props.products,
			isUploading: false
		};

		this.handleChangeProduct = this.handleChangeProduct.bind(this);
		this.handleClickProductsSave = this.handleClickProductsSave.bind(this);
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			products: newProps.products,
			isUploading: false
		});
	}

	handleChangeProduct(productId, productData) {
		this.requestChangeProduct(productId, productData);
	}

	handleClickProductsSave() {
		this.requestProductsSave();
	}

	requestChangeProduct(productId, productData) {
		const reducedProducts = this.state.products.map(product => product.data);
		const item = _.find(reducedProducts, {_id: productId});
		const index = _.findIndex(reducedProducts, item);
		const clonedProducts = _.cloneDeep(reducedProducts);
		clonedProducts.splice(index, 1, productData);

		const {merchantId} = this.props;
		const json = clonedProducts;

		xhr({
			url: `/api/merchants/${merchantId}/products/verify/`,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			switch (resp.statusCode) {
				case 200: {
					this.setState({products: data});
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось обновить товар');
					break;
				}
			}
		});
	}

	requestProductsSave() {
		this.setState({isUploading: true});

		const {merchantId} = this.props;
		const json = _.cloneDeep(this.state.products).map(product => product.data);

		xhr({
			url: `/api/merchants/${merchantId}/products/`,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isUploading: false});

			jQuery('.products-uploading-waiting-modal').modal('hide');

			switch (resp.statusCode) {
				case 201: {
					this.props.onSubmit(data);
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось загрузить товары');
					break;
				}
			}
		});
	}

	getProductById(id) {
		return _.find(this.state.products, product => product.data._id === id);
	}

	isInvalid() {
		let isInvalid = false;
		_.forEach(this.state.products, product => {
			if (!product.errors.length) {
				return;
			}
			isInvalid = true;
			return false;
		});
		return isInvalid;
	}

	render() {
		const {
			isUploading,
			products
		} = this.state;
		const {
			availableCategories
		} = this.props;
		const isInvalid = this.isInvalid();

		const availableCategoryOptions = availableCategories.reduce((a, b) => {
			a[b.name] = b.name;
			return a;
		}, {});

		const b = (
			<p className="text-right">
				<span style={{marginRight: '20px'}}>
					{'Добавлено '}

					<strong>
						{products.length}
					</strong>
				</span>

				<button
					className="btn btn-success"
					type="button"
					onClick={this.handleClickProductsSave}
					disabled={isInvalid || isUploading}
					data-toggle="modal"
					data-target=".products-uploading-waiting-modal"
					>
					{isUploading ? 'Загрузка...' : 'Подтвердить'}
				</button>
			</p>
		);

		return (
			<div className="goods-control">
				{b}

				<table className="table table-hover products-table">
					<thead>
						<tr>
							<th>
								<span>
									{FEED_CELL.name}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.startPrice}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.oldPrice}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.price}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.discount}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.country}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.brand}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.category}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.image}
								</span>
							</th>
						</tr>
					</thead>

					<tbody>
						{products.map(product => (
							<ProductsNewTableRow
								key={product.data._id}
								id={product.data._id}
								data={product.data}
								errors={product.errors}
								warnings={product.warnings}
								availableCategories={availableCategoryOptions}
								onChange={this.handleChangeProduct}
								/>
						))}
					</tbody>
				</table>

				{b}
			</div>
		);
	}
}
ProductsNewTable.propTypes = {
	availableCategories: React.PropTypes.array,
	merchantId: React.PropTypes.number,
	onSubmit: React.PropTypes.func,
	products: React.PropTypes.array
};
ProductsNewTable.defaultProps = {
	availableCategories: []
};

export default ProductsNewTable;

class ProductsNewTableRow extends React.Component {
	constructor(props) {
		super(props);
		const {errors, warnings} = props;
		this.state = {
			errors: this.processErrors(errors),
			warnings: this.processErrors(warnings)
		};

		this.handleChangeCell = this.handleChangeCell.bind(this);
		this.handleChangeCategory = this.handleChangeCategory.bind(this);
		this.handleChangeStartprice = this.handleChangeStartprice.bind(this);
	}

	componentWillReceiveProps(newProps) {
		const {errors, warnings} = newProps;
		this.setState({
			errors: this.processErrors(errors),
			warnings: this.processErrors(warnings)
		});
	}

	handleChangeCell(values) {
		const data = _.cloneDeep(this.props.data);
		values.forEach(item => {
			data[item.name] = item.value;
		});
		this.props.onChange(this.props.id, data);
	}

	handleChangeCategory(value) {
		const data = _.cloneDeep(this.props.data);
		data.category = value;
		this.props.onChange(this.props.id, data);
	}

	handleChangeStartprice() {
		const data = _.cloneDeep(this.props.data);
		data.startPrice = data.startPrice === 'да' ? 'нет' : 'да';
		this.props.onChange(this.props.id, data);
	}

	processErrors(errors) {
		return errors.reduce((a, b) => {
			if (!a[b.field]) {
				a[b.field] = [];
			}
			a[b.field].push(b.message);

			return a;
		}, {});
	}

	hasErrors(name) {
		const {errors} = this.state;
		return Boolean(errors[name]);
	}

	hasWarnings(name) {
		const {warnings} = this.state;
		return Boolean(warnings[name]);
	}

	getClassName(name) {
		if (this.hasErrors(name)) {
			return 'bg-danger';
		}

		if (this.hasWarnings(name)) {
			return 'bg-warning';
		}

		return '';
	}

	render() {
		const {errors, warnings} = this.state;
		const {
			availableCategories,
			data
		} = this.props;

		return (
			<tr>
				<td className={this.getClassName('name') || this.getClassName('url')}>
					<ErrorNotification
						name="name"
						errors={errors}
						warnings={warnings}
						/>

					<ErrorNotification
						name="url"
						errors={errors}
						warnings={warnings}
						/>

					<EditableCell
						values={[
							{
								name: 'name',
								value: data.name
							},
							{
								name: 'url',
								value: data.url
							}
						]}
						onChange={this.handleChangeCell}
						>
						<a
							href={data.url}
							target="_blank"
							rel="noopener noreferrer"
							>
							{data.name}
						</a>
					</EditableCell>
				</td>

				<td className={this.getClassName('startPrice')}>
					<ErrorNotification
						name="startPrice"
						errors={errors}
						warnings={warnings}
						/>

					{(data.price || data.price === 0) && (data.oldPrice || data.oldPrice === 0) ? (
						<input
							type="checkbox"
							onChange={this.handleChangeStartprice}
							checked={data.startPrice === 'да'}
							/>
					) : null}
				</td>

				<td className={this.getClassName('oldPrice')}>
					<ErrorNotification
						name="oldPrice"
						errors={errors}
						warnings={warnings}
						/>

					<EditableCell
						values={[{
							name: 'oldPrice',
							value: data.oldPrice
						}]}
						onChange={this.handleChangeCell}
						>
						{data.startPrice === 'да' ? 'от ' : ''}

						{data.oldPrice || data.oldPrice === 0 ? (
							<Price
								cost={formatPrice(data.oldPrice)}
								type="old"
								currency="₽"
								/>
						) : null}
					</EditableCell>
				</td>

				<td className={this.getClassName('price')}>
					<ErrorNotification
						name="price"
						errors={errors}
						warnings={warnings}
						/>

					<EditableCell
						values={[{
							name: 'price',
							value: data.price
						}]}
						onChange={this.handleChangeCell}
						>
						{data.startPrice === 'да' ? 'от ' : ''}

						{data.price || data.price === 0 ? (
							<strong>
								<Price
									cost={formatPrice(data.price)}
									currency="₽"
									/>
							</strong>
						) : null}
					</EditableCell>
				</td>

				<td className={this.getClassName('discount')}>
					<ErrorNotification
						name="discount"
						errors={errors}
						warnings={warnings}
						/>

					<EditableCell
						values={[{
							name: 'discount',
							value: data.discount
						}]}
						onChange={this.handleChangeCell}
						>
						<strong>
							{data.discount}
						</strong>

						{data.discount ? ' %' : null}
					</EditableCell>
				</td>

				<td className={this.getClassName('country')}>
					<ErrorNotification
						name="country"
						errors={errors}
						warnings={warnings}
						/>

					<EditableCell
						values={[{
							name: 'country',
							value: data.country
						}]}
						onChange={this.handleChangeCell}
						>
						{data.country}
					</EditableCell>
				</td>

				<td className={this.getClassName('brand')}>
					<ErrorNotification
						name="brand"
						errors={errors}
						warnings={warnings}
						/>

					<EditableCell
						values={[{
							name: 'brand',
							value: data.brand
						}]}
						onChange={this.handleChangeCell}
						>
						{data.brand}
					</EditableCell>
				</td>

				<td className={this.getClassName('category')}>
					<ErrorNotification
						name="category"
						errors={errors}
						warnings={warnings}
						/>

					<Select
						options={availableCategories}
						selected={data.category}
						onChange={this.handleChangeCategory}
						/>
				</td>

				<td className={this.getClassName('image')}>
					<ErrorNotification
						name="image"
						errors={errors}
						warnings={warnings}
						/>

					<EditableCell
						values={[
							{
								name: 'image',
								value: data.image
							}
						]}
						onChange={this.handleChangeCell}
						>
						{data.image ? (
							<img
								src={data.image}
								className="img-thumbnail"
								alt=""
								width="50"
								height="50"
								/>
						) : null}
					</EditableCell>
				</td>
			</tr>
		);
	}
}
ProductsNewTableRow.propTypes = {
	id: React.PropTypes.number,
	data: React.PropTypes.object,
	errors: React.PropTypes.array,
	warnings: React.PropTypes.array,
	availableCategories: React.PropTypes.object,
	onChange: React.PropTypes.func
};
ProductsNewTableRow.defaultProps = {
	errors: [],
	warnings: []
};

class ErrorNotification extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const {
			errors,
			warnings,
			name
		} = this.props;

		if (!errors[name] && !warnings[name]) {
			return null;
		}

		return (
			<span>
				{errors[name] && errors[name].length ? (
					<Popover
						className="text-danger"
						placement="top"
						html="true"
						content={errorNotificationList(errors[name])}
						>
						<Glyphicon name="ban-circle"/>
					</Popover>
				) : null}

				{warnings[name] && warnings[name].length ? (
					<Popover
						className="text-warning"
						placement="top"
						html="true"
						content={errorNotificationList(warnings[name])}
						>
						<Glyphicon name="warning-sign"/>
					</Popover>
				) : null}
			</span>
		);
	}
}
ErrorNotification.propTypes = {
	name: React.PropTypes.string,
	errors: React.PropTypes.object,
	warnings: React.PropTypes.object
};
ErrorNotification.defaultProps = {
};

function errorNotificationList(errors) {
	let list = '<ul><li>';
	list += errors.join('</li><li>');
	list += '</li></ul>';
	return list;
}
