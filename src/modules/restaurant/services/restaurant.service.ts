
export class RestaurantService{

    private restaurantRepo = new RestaurantRepository();

    //get all restaurants
   async getRestaurants(
    page:number,
    limit:number,
    search?:string
){

    if(page < 1){
        page = 1;
    }

    if(limit < 1){
        limit = 10;
    }

    const data =
    await this.restaurantRepo.getRestaurants(
        page,
        limit,
        search
    );

    return {
        data:data.restaurants,

        pagination:{
            page,
            limit,
            total:data.total
        }
    };
}


    //get restaurant by id
    async getRestaurantById(restaurantId: string): Promise<void>{
        try{

        }
        catch(err){
            throw err;
        }
    }

    //create restaurant
    async createRestaurant(data: any): Promise<void>{
        try{
            
        }
        catch(err){
            throw err;
        }   
    }
}