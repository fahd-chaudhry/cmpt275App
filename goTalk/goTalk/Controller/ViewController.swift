//
//  ViewController.swift
//  DEMOHSBC
//
//  Created by Ryan on 2017-10-26.
//  Copyright © 2017 night.owls. All rights reserved.
//

import UIKit

class ViewController: UITableViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        //  Commentred by Ryan on 2017-10-26.
        navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Logout",style: .plain, target: self, action: #selector(handleLogout))
        
    }
    @objc func handleLogout(){
        let loginController = LoginController()
        
        present(loginController, animated: true, completion: nil)
    }
    
    func preferredStatusBarStyle() -> UIStatusBarStyle{
        return.lightContent
    }
    
    //  Commented out by Ryan on 2017-10-26.
    
    //    override func didReceiveMemoryWarning() {
    //        super.didReceiveMemoryWarning()
    //        // Dispose of any resources that can be recreated.
    //    }
}

//  mod out by Ryan on 2017-10-26.
extension UIColor {
    convenience init(r: CGFloat, g: CGFloat, b: CGFloat){
        self.init(red: r/255, green: g/255, blue: b/255, alpha: 1)
    }
}

