use std::env;
use std::fs::File;
use std::io::prelude::*;
use std::os::unix::io::FromRawFd;

fn main() {
    let args: Vec<String> = env::args().collect();
    let mut i = 0;
    let mut o = 0;
    let mut ib = false;
    let mut ob = false;

    for j in 0..args.len() {                                        //checking indexes of starting arguments
        match args[j].as_str() {
            "o" => {
                o = j;
                ob = true;
            }
            "i" => {
                println!("testiiiii");
                i = j;
                ib = true
            }
            "O" => {
                println!("hmmm {}", args[j + 1]);
                o = j;
                ob = true
            }
            "I" => {
                i = j;
                ib = true;
            }
            _ => {}
        }
    }
    if ib || ob {                                                                                   //flag handlers
        if ib {
            match args[i].as_str() {
                "i" => {
                    let f1 = nastavi("fileI".to_string(), &args[i + 1]);
                    let mut f2 = nastavi("standardO".to_string(), &"".to_string());
                    transfer_data(&f1, &mut f2);
                }
                "I" => {
                    let f1 = nastavi("fd".to_string(), &args[i + 1]);
                    let mut f2 = nastavi("standardO".to_string(), &"".to_string());
                    transfer_data(&f1, &mut f2);
                }
                _ => {}
            }
        }
        if ob {
            match args[o].as_str() {
                "o" => {
                    let f1 = nastavi("standardI".to_string(), &"".to_string());
                    let mut f2 = nastavi("fileO".to_string(), &args[o + 1]);
                    transfer_data(&f1, &mut f2);
                }
                "O" => {
                    let f1 = nastavi("standardI".to_string(), &"".to_string());
                    let mut f2 = nastavi("fd".to_string(), &args[o + 1]);
                    transfer_data(&f1, &mut f2);
                }
                _ => {}
            }
        }
    } else {
        let f1 = nastavi("standardI".to_string(), &"".to_string());
        let mut f2 = nastavi("standardO".to_string(), &"".to_string());
        transfer_data(&f1, &mut f2);
    }
}

fn nastavi(tip: String, inp: &String) -> File {                                                     //prepering the file descryptor based on starting arguments
    match tip.as_str() {
        "fd" => {
            let fd = inp.parse::<i32>().unwrap();
            let f = unsafe { File::from_raw_fd(fd) };
            return f;
        }
        "fileI" => {
            let f = File::open(inp).unwrap();
            return f;
        }
        "fileO" => {
            let f = File::create(inp).unwrap();
            return f;
        }
        "standardI" => {
            let f = unsafe { File::from_raw_fd(0) };
            return f;
        }
        "standardO" => {
            let f = unsafe { File::from_raw_fd(1) };
            return f;
        }
        &_ => {
            let f = unsafe { File::from_raw_fd(1) };
            return f;
        }
    }
}

fn transfer_data(mut file1: &File, mut file2: &File) {                                            //goes trough the content held by the first file/file descryptor and sends it to the 2nd
    let mut buff = [0u8; 256];
    loop {
        let n = file1.read(&mut buff).unwrap();
        let buff = buff[0..n].to_vec();
        if n <= 0 {
            break;
        }
        let mut s = String::new();
        for byte in &buff {
            s = format!("{} {}", s, byte);
        }
        file2.write_all(s.as_bytes()).unwrap();
        file2.flush().unwrap();
    }
}
