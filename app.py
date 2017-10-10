# -*- coding: utf-8 -*-
from bottle import Bottle, run, template, static_file, redirect, response, request, BaseRequest
import json, time, logging, os
import mysql.connector
from util.index import next_id

app = Bottle()

BaseRequest.MEMFILE_MAX = 1024 * 1024 

conn = mysql.connector.connect(user='root', password='12345', database='awesome')     
# 静态文件
@app.route('/static/:path#.+#', name='static')
def static(path):
  return static_file(path, root='static')
@app.route('/upload/:path#.+#', name='static')
def static(path):
  return static_file(path, root='upload')

# 页面路由
@app.route('/signup')
def page_signin():
  return template('./view/signup.html')

@app.route('/signin')
def page_signup():
  if request.get_cookie('author'):
    redirect('./blogs')
  else:
    return template('./view/signin.html')

@app.route('/blogs')
def page_blogs():
  author = request.get_cookie('author')
  if author:
    cursor = conn.cursor(dictionary = True) # 创建数据游标
    cursor.execute("SELECT * FROM users WHERE id = %s", (author,))
    user = cursor.fetchone()
    conn.commit()
    cursor.close()
    return template('./view/blogs.html',username = user['name'], userimage = user['image'] )
  else:
    redirect('/signin')

@app.route('/blog/<id>')
def page_blog(id):
  cursor = conn.cursor(dictionary = True) # 创建数据游标
  cursor.execute("SELECT a.name,a.image,b.* FROM users AS a,blogs AS b WHERE  b.author_id = a.id AND %s = b.id  ", (id,))
  row = cursor.fetchone()
  conn.commit()
  cursor.close()
  createTime = time.strftime("%Y-%m-%d", time.localtime(row["created_at"]))
  return template('./view/blog.html', blog = row, userImage = ".%s" % (row["image"],), createTime = createTime)

@app.route('/types')
def page_types():
  author = request.get_cookie('author')
  if author:
    cursor = conn.cursor(dictionary = True) # 创建数据游标
    cursor.execute("SELECT * FROM users WHERE id = %s", (author,))
    user = cursor.fetchone()
    conn.commit()
    cursor.close()
    return template('./view/types.html', userName = user['name'], userImage = user['image'])
  else:
    redirect('/signin')


@app.error(404)
def error404(error):
  return static_file('404.html', root = './view/')

# 接口路由
@app.route('/api/signup', method='POST')
def api_signup():
  cursor = conn.cursor(dictionary = True) # 创建数据游标
  email = request.forms.email.strip()
  password = request.forms.password.strip()
  name = request.forms.name.strip()
  logging.info("signup new user by name: %s, email: %r, passwd: %s" % (name, email, password))
  cursor.execute("SELECT * FROM users WHERE email = %s", (str(email),))
  result = cursor.fetchone()
  if not result is None:
    conn.rollback()
    return json.dumps({ 'code': 201, 'msg': '邮箱已注册！' }) 
  try:
    # 执行查询
    query = ("INSERT INTO users (id, email, passwd, admin, name, image, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s)")
    cursor.execute(query, (next_id(), email, password, 1 , name, './static/default.png', time.time()))
    conn.commit()
    return json.dumps({'code': 200, 'msg': '注册成功！'})
  except Exception as e:
    logging.error(str(e))
    conn.rollback()
    return json.dumps({'code':500, 'msg': str(e)})
  finally:
    cursor.close

@app.route('/api/signin', method='POST')
def api_signin():
  cursor = conn.cursor(dictionary = True) # 创建数据游标
  email = request.forms.email.strip()
  password = request.forms.password.strip()
  cursor.execute("SELECT * FROM users WHERE email = %s", (str(email),))
  result = cursor.fetchone()
  print(result)
  cursor.close()
  if result == None:
    return json.dumps({ 'code': 202, 'msg': '邮箱未注册！' })
  elif result['passwd'] != password:
    return json.dumps({ 'code': 203, 'msg': '密码错误！' })
  else:
    logging.info('signin by user:%s' % (result['name']))
    response.set_cookie('author', result['id'], max_age = 60*1000, path="/")
    return json.dumps({ 'code': 200, 'msg': '登录成功', 'user': {
      'name': result['name'],
      'image': result['image']
    } })

@app.route('/api/getBlogs', method="GET")
def api_getBlogs():
  cursor = conn.cursor(dictionary = True) # 创建数据游标
  author_id = request.get_cookie('author')
  if request.query.get('self') == 'false':
    author_id = request.get_cookie('author')
    cursor.execute("SELECT a.name,a.image,b.* FROM users AS a,blogs AS b WHERE  b.author_id = a.id AND %s = b.author_id  ", (author_id,))
  else:
    cursor.execute("SELECT a.name,a.image,b.* FROM users AS a,blogs AS b WHERE  b.author_id = a.id")
  row = cursor.fetchall()
  conn.commit()
  cursor.execute("SELECT types FROM users WHERE  id = %s", (author_id,))
  types = cursor.fetchone()["types"]
  conn.commit()
  cursor.close()
  return json.dumps({ 'code': 200, 'data': { "blogs":row , "types" : types} })

@app.route('/api/setBlog', method="POST")
def api_addBlog():
  cursor = conn.cursor(dictionary = True) # 创建数据游标
  author_id = request.get_cookie('author')
  title = request.forms.title.strip()
  types = request.forms.type.strip()
  content = request.forms.content.strip()
  blogId = request.forms.id.strip()
  if blogId == 'null':
    try:
      query = ("INSERT INTO blogs (id, title, content, author_id,  type, created_at) VALUES (%s, %s, %s, %s, %s, %s)")
      cursor.execute(query, (next_id(), title, content, author_id, types, time.time()))
      conn.commit()
      return json.dumps({ 'code': 200, 'msg': '添加成功' })
    except Exception as e:
      logging.error(str(e))
      conn.rollback()
      return json.dumps({'code':500, 'msg': str(e)})
    finally:
      cursor.close
  else:
    try:
      query = ("UPDATE blogs SET title = %s, type= %s, content = %s WHERE id= %s ")
      cursor.execute(query, (title, types, content, blogId))
      conn.commit()
      return json.dumps({ 'code': 200, 'msg': '修改成功' })
    except Exception as e:
      logging.error(str(e))
      conn.rollback()
      return json.dumps({'code':500, 'msg': str(e)})
    finally:
      cursor.close

@app.route('/api/deleteBlog', method="POST")
def api_deleteBlog():
  cursor = conn.cursor(dictionary = True) # 创建数据游标
  blogId = request.forms.id.strip()
  try:
    cursor.execute("DELETE FROM blogs WHERE id = %s", (blogId,))
    conn.commit()
    return json.dumps({ 'code': 200, 'msg': '删除成功' })
  except Exception as e:
    logging.error(str(e))
    conn.rollback()
    return json.dumps({'code':500, 'msg': str(e)})
  finally:
    cursor.close

@app.route('/api/updateUser', method="POST")
def api_updateUser():
  cursor = conn.cursor(buffered=True) # 创建数据游标
  userId = request.get_cookie('author')
  name = request.forms.name.strip()
  passwd = request.forms.passwd.strip()
  try:
    cursor.execute("UPDATE users SET name = %s, passwd = %s WHERE id= %s", (name, passwd, userId))
    conn.commit()
    return json.dumps({ 'code': 200, 'msg': '更新成功' })
  except Exception as e:
    logging.error(str(e))
    conn.rollback()
    return json.dumps({'code':500, 'msg': str(e)})
  finally:
    cursor.close

@app.route('/api/updateImg', method="POST")
def api_upload():
  cursor = conn.cursor(buffered=True) # 创建数据游标
  userImg = request.files.get('userImg')
  name, ext = os.path.splitext(userImg.filename)
  if ext not in ('.png','.jpg','.jpeg'):
      return json.dumps({ 'code': 201, 'msg': '只能保存' })
  try:
    userId = request.get_cookie('author')
    save_path = './upload/%s%s' % (''.join(str(time.time()).split('.')),ext)
    userImg.save(save_path)
    query = ("UPDATE users SET image = %s WHERE id= %s ")
    cursor.execute(query, (save_path,userId))
    conn.commit()
    return json.dumps({ 'code': 200, 'msg': '更新成功', 'url': save_path })
  except Exception as e:
    logging.error(str(e))
    conn.rollback()
    return json.dumps({'code':500, 'msg': str(e)})
  finally:
    cursor.close

@app.route('/api/getType', method="GET")
def api_getType():
  cursor = conn.cursor(dictionary = True) # 创建数据游标
  author_id = request.get_cookie('author')
  try:
    cursor.execute("SELECT types FROM users WHERE id = %s", (author_id,))
    types = cursor.fetchone()
    typeArr = types['types'].split(",")
    conn.commit()
    cursor.execute("SELECT type FROM blogs WHERE author_id = %s", (author_id,))
    data = cursor.fetchall()
    dataArr = []
    for i in range(len(typeArr)):
      dataArr.append(0)
      for j in data:
        if j['type'] == typeArr[i] :
          dataArr[i] += 1 
    conn.commit()
    return json.dumps({ 'code': 200, 'data': { 'types':typeArr, 'data': dataArr, "max": len(data)} })
  except Exception as e:
    logging.error(str(e))
    conn.rollback()
    return json.dumps({'code':500, 'msg': str(e)})
  finally:
    cursor.close


@app.route('/api/addType', method="POST")
def api_addType():
  cursor = conn.cursor(dictionary = True) # 创建数据游标
  author_id = request.get_cookie('author')
  text = request.forms.types.strip()
  try:
    cursor.execute("UPDATE users SET types = %s WHERE id = %s", (text,author_id))
    conn.commit()
    return json.dumps({ 'code': 200, 'msg': '添加成功' })
  except Exception as e:
    logging.error(str(e))
    conn.rollback()
    return json.dumps({'code':500, 'msg': str(e)})
  finally:
    cursor.close

@app.route('/api/deleteType', method="POST")
def api_deleteType():
  cursor = conn.cursor(dictionary = True) # 创建数据游标
  author_id = request.get_cookie('author')
  text = request.forms.text.strip()
  try:
    cursor.execute("SELECT types FROM users WHERE id = %s", (author_id,))
    oldTypes = cursor.fetchone()["types"]
    conn.commit()
    match = oldTypes.index(text)
    if match<0 :
      return json.dumps({ 'code': 201, 'msg': '此博客分类不存在' })
    cursor.execute("UPDATE blogs SET type = %s WHERE type = %s and author_id = %s", (None,text,author_id))
    conn.commit()
    newTypes = oldTypes[:(match if (match + len(text)) != len(oldTypes) else (match-1))]+oldTypes[(match+len(text)+1):]
    cursor.execute("UPDATE users SET types = %s WHERE id = %s", (newTypes,author_id))
    conn.commit()
    return json.dumps({ 'code': 200, 'msg': '删除成功' })
  except Exception as e:
    logging.error(str(e))
    conn.rollback()
    return json.dumps({'code':500, 'msg': str(e)})
  finally:
    cursor.close

run(app,host="localhost", port = 8089)