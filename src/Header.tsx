import { Children, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doLogout, doLogin } from "./Web3Service";

function Header(){

    const navigate = useNavigate();

    useEffect(() => {


        if(localStorage.getItem("account") !== null)
            if(localStorage.getItem("isAdmin") === "true")
                doLogin()
                    .then(result => {
                            if(result.isAdmin){
                                //Admin pode ir para a pagina que ele quiser
                                const currentPath = window.location.pathname;
                                navigate(currentPath);
                                //navigate("/admin");
                            }
                            else{
                                localStorage.setItem("isAdmin", "false");
                                navigate("/app");
                            }    

                        })
                    .catch(err => {
                        console.error(err);
                        onLogoutClick();
                    });
            else
                navigate("/app");
        else
            navigate("/");

    }, []);

    function onLogoutClick(){
        doLogout();
        navigate("/");

    }

    return(
        <header className="d-flex flex-wrap justify-content-center py-3 mb-4">
            <a href="/app" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-light text-decoration-none">
            <span className="fs-4">Dapp Odd or Even</span>
            </a>

                    
            <div className="col-md-3 text-end">
                <button type="button" className="btn btn-outline-danger me-2" onClick={onLogoutClick}>
                    Logout
                </button>
                
            </div>
    
        </header>
  
    )

}

export default Header;