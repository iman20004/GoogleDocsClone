const Login = () => {
    return (

        <form action="http://rushhour.cse356.compas.cs.stonybrook.edu/users/login" method="post">
            <div class="container">
                <h1>Login</h1>

                <div>
                    <label for="email"><b>Email</b></label>
                    <input type="text" placeholder="Enter Email" name="email" id="email" required></input>

                    <label for="password"><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" name="password" id="password" required></input>
                </div>

                <button type="submit" class="loginbtn" id="login-btn">Login</button>
            </div>
        </form>
    );
}

export default Login;