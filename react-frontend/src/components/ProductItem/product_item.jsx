import React, { Component } from 'react';

import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.css'
import CommentPopper from './comment_popper'
import ebayPic from './images/ebay.png'
import amazonPic from './images/amazon.png'
import walmartPic from './images/walmart.png'
import {Button, Chip} from '@mui/material';
import {Colors} from '@mui/material'
import config from '../../config.json'

class ProductItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            star:0.0,
            comments: [],
            loadingComments : false,
            finishedLoading : false
        }
    }
    
        

    handleAddCart() {
        String.prototype.hashCode = function(){
            var hash = 0;
            if (this.length == 0) return hash;
            for (let i = 0; i < this.length; i++) {
                let char = this.charCodeAt(i);
                hash = ((hash<<5)-hash)+char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
        }
        const product = this.props.product;
        const product_id = product.title.hashCode()
        this.props.updateCartItem(product_id, product)
    }

    render() {
        return(
            <div className="row p-2 mt-4 item_container item_card_border">
                <div className="col-md-3 mt-1"><img className="rounded product_img" src={this.props.product.img_url} alt="not available" loading="lazy"></img></div>
                <div className="col-md-6 mt-1 d-flex align-items-start flex-column bd-highlight mb-1">
                    <div className="mb-auto p-2 bd-highlight">
                        <h5><a className="link-unstyled" href={this.props.product.link} target="_blank">{this.props.product.title}</a></h5>
                    </div>
                    {this.renderLabels()}
                    {(this.props.product.reviews!=0) && 
                    <div className="d-flex flex-row mb-2 p-2 py-0">
                        <span> {(this.props.product.stars?parseFloat(this.props.product.stars.split(" ")[0]):0.0).toFixed(1)}&nbsp;</span>
                        {this.renderStars()}
                        <span> &nbsp;{this.props.product.reviews || "no"} reviews</span>
                    </div>            
                    }
                    <div className="d-flex flex-row px-2">
                         {<CommentPopper comments={this.state.comments} getComments={this.getComments} loadingComments={this.state.loadingComments}/>}
                    </div>
                </div>
                <div className="flex-col align-items-start align-content-center col-md-3 mt-1 position-relative"
                style={{"borderLeft":"1px solid rgb(200, 200, 200)"}}>
                    <div className="d-flex flex-row justify-content-between">
                        <h4>{this.renderPrice()}</h4>
                        {this.renderDiscount()}
                    </div>
                    <div className="d-flex flex-row align-items-center mt-0">
                        {this.renderPrevPrice()}
                    </div>
                    <div className="d-flex flex-column mt-auto fixed-bottom position-absolute bottom-0 px-3"
                    style={{zIndex:0}}>
                        <a href={this.props.product.link} target="_blank" className='link-unstyled'><Button variant="contained" className="" type="button" sx={{width:"100%"}}>Details</Button></a>
                        <Button variant="contained" sx={{marginTop:"3px"}} type="button" onClick={()=>this.handleAddCart()}>Add to cart</Button>

                        <div className="d-flex flex-row mb-0">
                            <p className="m-0">From:{this.renderWebsite()}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    renderPrice() {
        if (this.props.product.price!=null && this.props.product.price.charAt(0) !== '$') {
            return (<a href={this.props.product.link} target="_blank">See price</a>)
        }
        else {
            return this.props.product.price
        }
    }

    renderPrevPrice() {
        if (this.props.product.prev_price) {
            return (<p><s>{this.props.product.prev_price}</s></p>)
        }
    }

    renderDiscount() {
        if (this.props.product.discount) {
            return (<h5 className="text-danger">-{this.props.product.discount}</h5>)
        }
    }

    renderWebsite() {
        if (this.props.product.website==="ebay") {
            return (<img className="website_img" src={ebayPic} alt="unknown"></img>)
        }
        else if (this.props.product.website==="Amazon") {
            return (<img className="website_img" src={amazonPic} alt="unknown"></img>)
        }
        else if (this.props.product.website==="walmart") {
            return (<img className="website_img" src={walmartPic} alt="unknown"></img>)
        }
        else {
            return (this.props.product.website)
        }
    }

    //render the star icons based on how many stars the product have
    renderStars() {
        var stars_icons = [];
        var star_num = this.props.product.stars?parseFloat(this.props.product.stars.split(" ")[0]):0.0
        for (var i = 0; i < 5; i++) {
            if(star_num>=1) {
                stars_icons.push(<i className="bi bi-star-fill yellow" key={i}></i>)
            }
            else if (star_num>=0.5) {
                stars_icons.push(<i className="bi bi-star-half yellow" key={i}></i>)
            }
            else {
                stars_icons.push(<i className="bi bi-star yellow" key={i}></i>)
            }
            star_num--
        }

        return (
            <div className="ratings mr-2">
                {stars_icons}
            </div>
        )
    }

    renderLabels() {
        if (this.props.product.labels) {
            var labelsChips = [];
            for (var i = 0; i < this.props.product.labels.length; i++) {
                if (this.props.product.labels[i] !== "")
                labelsChips.push(<Chip color="secondary" key={i} label={this.props.product.labels[i]} sx={{"marginRight":"1px"}}></Chip>)
            }
            return (
                <div className="d-flex flex-row mb-1 pb-0">
                    {labelsChips}
            </div>)
        }
    }

    //get the comment info of a product
    getComments =()=> {
        if (!this.state.finishedLoading && this.state.comments.length===0 && !this.state.loadingComments) {
            this.setState({loadingComments:true})
            const url = this.props.product.link
            axios.post(config.REACT_APP_BACKEND_API+"/comment_search/"+this.props.product.website, {url:url}).then(res=>{
                const comments = res.data
                this.setState({comments, loadingComments:false, finishedLoading:true})
            })
        }
    }
}

export default ProductItem