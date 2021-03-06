/* global toastr _ jQuery */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import Price from 'react-price';
import xhr from 'xhr';
import b from 'b_';
import {FEED_CELL, TOKEN} from '../const.js';
import {formatPrice, processErrors} from '../utils.js';
import Select from '../components/select.jsx';
import EditableCell from './editable-cell.jsx';
import ProductsTableCell from './products-table-cell.jsx';
import IsLoadingWrapper from '../components/is-loading-wrapper.jsx';
import ProductsTableHelpIcon from './products-table-help-icon.jsx';

const className = 'products-table';

class ProductsNewTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			products: props.products,
			isLoading: false,
			isUploading: false,
			categoriesAvailableOptions: this.processCategoriesAvailableOptions(props.categoriesAvailable)
		};

		this.handleChangeProduct = this.handleChangeProduct.bind(this);
		this.handleClickProductsSave = this.handleClickProductsSave.bind(this);
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			products: newProps.products,
			isUploading: false,
			categoriesAvailableOptions: this.processCategoriesAvailableOptions(newProps.categoriesAvailable)
		});
	}

	processCategoriesAvailableOptions(categoriesAvailable) {
		const categoriesAvailableOptions = categoriesAvailable.map(category => ({
			id: String(category.name).toLowerCase(),
			name: category.name
		}));
		categoriesAvailableOptions.unshift({
			id: '',
			name: ''
		});
		return categoriesAvailableOptions;
	}

	handleChangeProduct(productId, productData) {
		this.requestChangeProduct(productId, productData);
	}

	handleClickProductsSave() {
		this.requestProductsSave();
	}

	processProductPrice(product) {
		const {
			oldPrice,
			price,
			startPrice,
			discount
		} = product;

		if (price || price === 0 || oldPrice || oldPrice === 0) {
			product.startPrice = null;
			product.discount = null;
		} else if (startPrice || startPrice === 0) {
			product.oldPrice = null;
			product.price = null;
			product.discount = null;
		} else if (discount || discount === 0) {
			product.oldPrice = null;
			product.price = null;
			product.startPrice = null;
		}

		return product;
	}

	processProductEmpty(product) {
		_.forEach(product, (i, k) => {
			if (product[k] === '') {
				product[k] = null;
			}
		});
		return product;
	}

	processProduct(product) {
		let productProcessed = _.cloneDeep(product);
		productProcessed = this.processProductPrice(productProcessed);
		productProcessed = this.processProductEmpty(productProcessed);
		return productProcessed;
	}

	requestChangeProduct(productId, productData) {
		this.setState({isLoading: true});

		const productProcessed = this.processProduct(productData);

		const {merchantId} = this.props;
		const json = [productProcessed];

		xhr({
			url: `/api/merchants/${merchantId}/products/verify/`,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});
			switch (resp.statusCode) {
				case 200: {
					this.productUpdate(productId, data[0]);
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
		const json = _.cloneDeep(this.state.products).map(product => {
			return this.processProduct(product.data);
		});

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
					if (data.detail) {
						if (data.detail === 'out_of_limit') {
							toastr.warning('Превышен лимит');
						}
					} else if (Array.isArray(data) && data[0] && data[0].data) {
						data.forEach(item => {
							this.productUpdate(item.data._id, item, false);
						});
						this.forceUpdate();
					} else {
						processErrors(data);
					}
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

	productUpdate(productId, productData, update = true) {
		const {
			products
		} = this.state;

		const product = this.getProductById(productId);
		const index = _.findIndex(products, product);
		products.splice(index, 1, productData);

		if (update) {
			this.forceUpdate();
		}
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
			categoriesAvailableOptions,
			isLoading,
			isUploading,
			products
		} = this.state;
		const isInvalid = this.isInvalid();
		const isWaiting = isLoading;

		const uploadPanel = (
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
			<div className="products-control">
				<IsLoadingWrapper isLoading={isWaiting}>
					{uploadPanel}

					<table className={'table table-bordered table-hover ' + b(className, 'table')}>
						<thead>
							<tr>
								<th className={b(className, 'table-th', {name: 'name'})}>
									<span>
										<ProductsTableHelpIcon name="name"/>

										{FEED_CELL.name}
									</span>
								</th>

								<th className={b(className, 'table-th', {name: 'oldprice'})}>
									<span>
										<ProductsTableHelpIcon name="oldprice"/>

										{FEED_CELL.oldPrice}
									</span>
								</th>

								<th className={b(className, 'table-th', {name: 'price'})}>
									<span>
										<ProductsTableHelpIcon name="price"/>

										{FEED_CELL.price}
									</span>
								</th>

								<th className={b(className, 'table-th', {name: 'startprice'})}>
									<span>
										<ProductsTableHelpIcon name="startprice"/>

										{FEED_CELL.startPrice}
									</span>
								</th>

								<th className={b(className, 'table-th', {name: 'discount'})}>
									<span>
										<ProductsTableHelpIcon name="discount"/>

										{FEED_CELL.discount}
									</span>
								</th>

								<th className={b(className, 'table-th', {name: 'country'})}>
									<span>
										<ProductsTableHelpIcon name="country"/>

										{FEED_CELL.country}
									</span>
								</th>

								<th className={b(className, 'table-th', {name: 'brand'})}>
									<span>
										<ProductsTableHelpIcon name="brand"/>

										{FEED_CELL.brand}
									</span>
								</th>

								<th className={b(className, 'table-th', {name: 'category'})}>
									<span>
										<ProductsTableHelpIcon name="category"/>

										{FEED_CELL.category}
									</span>
								</th>

								<th className={b(className, 'table-th', {name: 'image'})}>
									<span>
										<ProductsTableHelpIcon name="image"/>

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
									categoriesAvailable={categoriesAvailableOptions}
									onChange={this.handleChangeProduct}
									/>
							))}
						</tbody>
					</table>

					{uploadPanel}
				</IsLoadingWrapper>
			</div>
		);
	}
}
ProductsNewTable.propTypes = {
	categoriesAvailable: React.PropTypes.array,
	merchantId: React.PropTypes.number,
	onSubmit: React.PropTypes.func,
	products: React.PropTypes.array
};
ProductsNewTable.defaultProps = {
	categoriesAvailable: []
};

export default ProductsNewTable;

class ProductsNewTableRow extends React.Component {
	constructor(props) {
		super(props);
		const {
			data,
			errors,
			warnings
		} = props;
		const {
			discount = null,
			oldPrice = null,
			price = null,
			startPrice = null
		} = data;
		this.state = {
			activeEditableCell: null,
			prices: {
				discount,
				oldPrice,
				price,
				startPrice
			},
			errors: this.processErrors(errors),
			warnings: this.processErrors(warnings)
		};

		this.handleChangeCell = this.handleChangeCell.bind(this);
		this.handleChangeCategory = this.handleChangeCategory.bind(this);
	}

	componentWillReceiveProps(newProps) {
		const {
			data,
			errors,
			warnings
		} = newProps;
		const {
			discount = null,
			oldPrice = null,
			price = null,
			startPrice = null
		} = data;
		this.setState({
			activeEditableCell: null,
			prices: {
				discount,
				oldPrice,
				price,
				startPrice
			},
			errors: this.processErrors(errors),
			warnings: this.processErrors(warnings)
		});
	}

	handleChangeCell(values) {
		const firstItemName = values[0].name;
		const firstItemValue = values[0].value;

		if (firstItemName === 'price' || firstItemName === 'oldPrice') {
			let {
				price,
				oldPrice
			} = this.state.prices;

			if (firstItemValue) {
				if (firstItemName === 'price' && !oldPrice) {
					this.setState(previousState => {
						previousState.prices = {
							price: firstItemValue,
							oldPrice: null,
							startPrice: null,
							discount: null
						};
						previousState.activeEditableCell = 'oldPrice';
						return previousState;
					});
					return;
				} else if (firstItemName === 'oldPrice' && !price) {
					this.setState(previousState => {
						previousState.prices = {
							price: null,
							oldPrice: firstItemValue,
							startPrice: null,
							discount: null
						};
						previousState.activeEditableCell = 'price';
						return previousState;
					});
					return;
				}
			} else {
				price = null;
				oldPrice = null;
			}

			if (firstItemName === 'price') {
				values.push({
					name: 'oldPrice',
					value: oldPrice
				});
			} else if (firstItemName === 'oldPrice') {
				values.push({
					name: 'price',
					value: price
				});
			}
			values.push({
				name: 'startPrice',
				value: null
			});
			values.push({
				name: 'discount',
				value: null
			});
		} else if (firstItemName === 'startPrice') {
			values.push({
				name: 'oldPrice',
				value: null
			});
			values.push({
				name: 'price',
				value: null
			});
			values.push({
				name: 'discount',
				value: null
			});
		} else if (firstItemName === 'discount') {
			values.push({
				name: 'oldPrice',
				value: null
			});
			values.push({
				name: 'price',
				value: null
			});
			values.push({
				name: 'startPrice',
				value: null
			});
		}

		const data = _.cloneDeep(this.props.data);
		values.forEach(item => {
			data[item.name] = item.value === '' ? null : item.value;
		});
		this.props.onChange(this.props.id, data);
	}

	handleChangeCategory(value) {
		const data = _.cloneDeep(this.props.data);
		data.category = value;
		this.props.onChange(this.props.id, data);
	}

	processErrors(errors) {
		if (!errors) {
			return {};
		}

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
		const {
			activeEditableCell,
			errors,
			prices,
			warnings
		} = this.state;
		const {
			categoriesAvailable,
			data
		} = this.props;

		const {
			price,
			oldPrice,
			startPrice,
			discount
		} = prices;
		let isOldPriceAvailable = true;
		let isPriceAvailable = true;
		let isStartPriceAvailable = true;
		let isDiscountAvailable = true;
		if (price || price === 0 || oldPrice || oldPrice === 0) {
			isStartPriceAvailable = false;
			isDiscountAvailable = false;
		} else if (startPrice || startPrice === 0) {
			isOldPriceAvailable = false;
			isPriceAvailable = false;
			isDiscountAvailable = false;
		} else if (discount || discount === 0) {
			isOldPriceAvailable = false;
			isPriceAvailable = false;
			isStartPriceAvailable = false;
		}

		return (
			<tr>
				<ProductsTableCell
					names={['name', 'url']}
					errors={errors}
					warnings={warnings}
					>
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
				</ProductsTableCell>

				<ProductsTableCell
					names={['oldPrice']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'oldPrice',
							value: oldPrice
						}]}
						onChange={this.handleChangeCell}
						opened={activeEditableCell === 'oldPrice'}
						>
						{isOldPriceAvailable && (oldPrice || oldPrice === 0) ? (
							<Price
								cost={formatPrice(oldPrice)}
								type="old"
								currency="₽"
								/>
						) : null}
					</EditableCell>
				</ProductsTableCell>

				<ProductsTableCell
					names={['price']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'price',
							value: price
						}]}
						onChange={this.handleChangeCell}
						opened={activeEditableCell === 'price'}
						>
						{isPriceAvailable && (price || price === 0) ? (
							<strong>
								<Price
									cost={formatPrice(price)}
									currency="₽"
									/>
							</strong>
						) : null}
					</EditableCell>
				</ProductsTableCell>

				<ProductsTableCell
					names={['startPrice']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'startPrice',
							value: startPrice
						}]}
						onChange={this.handleChangeCell}
						>
						{isStartPriceAvailable && (startPrice || startPrice === 0) ? (
							<Price
								cost={formatPrice(startPrice)}
								currency="₽"
								/>
						) : null}
					</EditableCell>
				</ProductsTableCell>

				<ProductsTableCell
					names={['discount']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'discount',
							value: discount
						}]}
						onChange={this.handleChangeCell}
						>
						{isDiscountAvailable ? (
							<strong>
								{discount}
							</strong>
						) : null}

						{isDiscountAvailable && discount ? ' %' : null}
					</EditableCell>
				</ProductsTableCell>

				<ProductsTableCell
					names={['country']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'country',
							value: data.country
						}]}
						onChange={this.handleChangeCell}
						>
						{data.country}
					</EditableCell>
				</ProductsTableCell>

				<ProductsTableCell
					names={['brand']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'brand',
							value: data.brand
						}]}
						onChange={this.handleChangeCell}
						>
						{data.brand}
					</EditableCell>
				</ProductsTableCell>

				<ProductsTableCell
					names={['category']}
					errors={errors}
					warnings={warnings}
					>
					<Select
						options={categoriesAvailable}
						selected={data.category}
						onChange={this.handleChangeCategory}
						/>
				</ProductsTableCell>

				<ProductsTableCell
					names={['image']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'image',
							value: data.image
						}]}
						onChange={this.handleChangeCell}
						>
						{data.image ? (
							<img
								src={data.image}
								alt=""
								/>
						) : null}
					</EditableCell>
				</ProductsTableCell>
			</tr>
		);
	}
}
ProductsNewTableRow.propTypes = {
	categoriesAvailable: React.PropTypes.array,
	data: React.PropTypes.object,
	errors: React.PropTypes.array,
	id: React.PropTypes.number,
	onChange: React.PropTypes.func,
	warnings: React.PropTypes.array
};
ProductsNewTableRow.defaultProps = {
	errors: [],
	warnings: []
};
