import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Product } from '../class/Product';
import { ProductType } from '../class/ProductType';
import { AppUtility } from '../class/AppUtility';
import { EnumEx } from '../enum/EnumEx';
import { ProdTypeEnum } from '../enum/ProdTypeEnum';
import { Subject } from 'rxjs/Subject';

declare var swal: any; //SweetAlert2 typings definition

@Injectable()
export class ProductService {

    private httpOptions: RequestOptions;
    constructor(
        //@Inject(FirebaseApp) private firebaseApp: any,
        private af: AngularFireAuth) {

    }

    //Query data from firebase
    private _queryProducts() {

        this.af.authState.subscribe(
            user => {
                if (!user) {
                    swal("Error", "Please login ... ", "error");
                }
            },
            error => {}
        );

        return this.af.database.object('/Demo/products');
    }

    //Get Product types list
    public getProductTypes() {
        let prodTypes: ProductType[] = [];

        //Get name-value pairs from ProductTypeEnum
        let prodTypeEnumList = EnumEx.getNamesAndValues(ProdTypeEnum);

        //Convert name-value pairs to ProductType[]
        prodTypeEnumList.forEach(pair => {
            let prodType = { 'id': pair.value.toString(), 'name': pair.name };
            prodTypes.push(prodType);
        });

        return prodTypes;

        //return PRODUCT_TYPES;
    }





    public getByKey(key: string) {
        //let subject$ = new Subject();
        //subject$.subscribe((key) => {
        //    let target = this.af.database.object('/Demo/products/' + key);
        //    target.take(1).subscribe(data => {
        //        console.log(data);
        //    })
        //});
        //subject$.next(key);

        return new Promise<Product>(
            resolve => {
                this.af.database.object('/Demo/products/' + key).subscribe(data => {
                    resolve(data);
                })
            });
    }

    public get(id: string) {
        return new Promise<Product>(
            resolve => {
                //From Firebase
                this._queryProducts().subscribe(data => {
                    if (data) {
                        let prod = data.find(x => x.Id == id);
                        resolve(prod);
                    }
                    else {
                        resolve(null);
                    }

                })

            });
    }

    //Get books
    public getBooks() {
        return new Promise<Product[]>(
            resolve => {

                //Use local const data
                //let books = PRODUCTS.filter(x => x.Type == "Book");

                //From Firebase
                this._queryProducts().subscribe(data => {
                    if (data) {
                        let books = data.filter(x => x.Type == "Book");
                        resolve(books);
                    }
                    else {
                        resolve([]);
                    }

                })

            });
    }
    //Get toys
    public getToys() {
        return new Promise<Product[]>(
            resolve => {
                //let toys = PRODUCTS.filter(x => x.Type == "Toy");
                //resolve(toys);

                //From Firebase
                this._queryProducts().subscribe(data => {
                    if (data) {
                        let toys = data.filter(x => x.Type == "Toy");
                        resolve(toys);
                    }
                    else {
                        resolve([]);
                    }
                });
            });
    }
    //Get toys
    public getMusic() {
        return new Promise<Product[]>(
            resolve => {
                //let musices = PRODUCTS.filter(x => x.Type == "Music");
                //resolve(musices);

                //From Firebase
                this._queryProducts().subscribe(data => {
                    if (data) {
                        let musices = data.filter(x => x.Type == "Music");
                        resolve(musices);
                    }
                    else {
                        resolve([]);
                    }
                });
            });
    }

    //Create new product
    public create(prod: Product) {
        //Set UUID to id
        prod.Id = AppUtility.generateUUID();

        var getPromise = new Promise(
            resolve => {
                let itemObservable = this._queryProducts();
                //console.log(itemObservable);
                let current = null;
                itemObservable.subscribe(value => {
                    current = value;
                    current.push(prod);
                    resolve(current);
                })
            }).then((newValue) => {
                //console.log(newValue);
                let itemObservable = this._queryProducts();
                itemObservable.update(newValue);
            });

        //Could also use the following codes to append a new object to database with specified key!
        //var getPromise = new Promise(
        //    resolve => {
        //        let itemObservable = this.af.database.object('/Demo/products/' + prod.Id);
        //        itemObservable.set(prod);
        //        resolve();
        //    });

        return getPromise;
    }

    //Update a product
    public update(prod: Product) {

        var getPromise = new Promise(
            resolve => {
                let itemObservable = this._queryProducts();
                let current: Product[] = [];
                itemObservable.subscribe(value => {
                    current = value;
                    for (let i = 0; i < current.length; i++) {
                        let item = current[i];
                        if (item.Id == prod.Id) {
                            item.Price = prod.Price;
                            item.Title = prod.Title;
                            item.TypeId = prod.TypeId;
                            item.Type = prod.Type;
                        }
                    }

                    resolve(current);
                })
            }).then((newValue) => {
                let itemObservable = this._queryProducts();
                itemObservable.update(newValue);
            });

        return getPromise;
    }

    //Remove all products
    public removeAll() {
        var getPromise = new Promise(
            resolve => {
                let itemObservable = this._queryProducts();
                itemObservable.remove();
            })
        return getPromise;
    }

    //Remove a product
    public remove(prod: Product) {
        var promise = new Promise(
            resolve => {
                let itemObservable = this._queryProducts();
                let current: Product[] = [];
                itemObservable.subscribe(value => {
                    current = value;

                    //Remove item
                    for (let i = 0; i < current.length; i++) {
                        let item = current[i];
                        if (item.Id == prod.Id) {
                            var index = current.indexOf(item);
                            current.splice(index, 1);
                        }
                    }

                    resolve(current);
                })
            }).then((newValue: Product[]) => {

                let itemObservable = this._queryProducts();
                let prods: Product[] = [];
                newValue.forEach(item => {
                    prods.push(item);
                });

                itemObservable.set(prods); //PS. Cannot use update() here.
            });

        return promise;
    }


}